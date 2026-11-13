"""Project endpoints: YouTube import, chunked upload, listing and detail."""

from __future__ import annotations

import re
import shutil
import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.config import settings
from app.database import get_db
from app.models import Project
from app.schemas import (
    ProjectDetailOut,
    ProjectEnvelope,
    ProjectListOut,
    UploadChunkOut,
    YouTubeCreateIn,
)
from app.services.pipeline import enqueue_project
from app.storage import storage

router = APIRouter(prefix="/projects", tags=["projects"])

UPLOAD_TMP_ROOT = Path(tempfile.gettempdir()) / "clipforge-uploads"
SAFE_ID = re.compile(r"^[A-Za-z0-9_-]{1,64}$")
YOUTUBE_HOSTS = ("youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be")


def _parts_dir(upload_id: str) -> Path:
    if not SAFE_ID.match(upload_id):
        raise HTTPException(status_code=400, detail="Invalid uploadId")
    return UPLOAD_TMP_ROOT / upload_id


def _safe_filename(filename: str) -> str:
    name = Path(filename).name.strip()
    if not name or name in {".", ".."}:
        raise HTTPException(status_code=400, detail="Invalid filename")
    return name


def _project_or_404(db: Session, project_id: str) -> Project:
    project = db.scalar(
        select(Project)
        .options(selectinload(Project.clips), selectinload(Project.transcript))
        .where(Project.id == project_id)
    )
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


def _cleanup_parts(upload_id: str) -> None:
    shutil.rmtree(UPLOAD_TMP_ROOT / upload_id, ignore_errors=True)


def _enqueue_and_refresh(db: Session, project: Project) -> Project:
    enqueue_project(project.id)
    db.expire_all()
    return _project_or_404(db, project.id)


@router.get("", response_model=ProjectListOut)
def list_projects(db: Session = Depends(get_db)) -> ProjectListOut:
    projects = db.scalars(
        select(Project)
        .options(selectinload(Project.clips))
        .order_by(Project.created_at.desc())
    ).all()
    return ProjectListOut(projects=list(projects))


@router.post("/youtube", response_model=ProjectEnvelope, status_code=status.HTTP_201_CREATED)
def create_from_youtube(payload: YouTubeCreateIn, db: Session = Depends(get_db)) -> ProjectEnvelope:
    url = payload.url.strip()
    if not url.startswith(("http://", "https://")):
        raise HTTPException(status_code=422, detail="A valid YouTube URL is required")
    if not any(host in url for host in YOUTUBE_HOSTS):
        raise HTTPException(status_code=422, detail="Only YouTube URLs are supported")

    video_id = "unknown"
    match = re.search(r"(?:v=|/shorts/|youtu\.be/)([A-Za-z0-9_-]{6,})", url)
    if match:
        video_id = match.group(1)

    project = Project(
        title=f"YouTube video · {video_id}",
        source="youtube",
        source_url=url,
        duration=0,
        language=payload.language,
        aspect_ratio=payload.aspect_ratio,
        status="processing",
        progress=5,
        step="download",
        thumbnail="from-violet-500 to-blue-500",
        settings={"clipLength": payload.clip_length, "templateId": payload.template_id},
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    project = _enqueue_and_refresh(db, project)
    return ProjectEnvelope(project=project)


@router.post("/upload", response_model=UploadChunkOut, status_code=status.HTTP_202_ACCEPTED)
async def upload_project(
    upload_id: str = Form(..., alias="uploadId"),
    chunk_index: int = Form(0, alias="chunkIndex"),
    total_chunks: int | None = Form(None, alias="totalChunks"),
    filename: str = Form(...),
    complete: bool = Form(False),
    chunk: UploadFile | None = File(None),
    db: Session = Depends(get_db),
) -> UploadChunkOut:
    """Chunked upload protocol used by `lib/api.ts`.

    Each request stores one part under the OS temp directory. The final request
    (``complete=true``) concatenates the parts, stores the source file and
    creates the project. Swapping the temp directory for S3 multipart uploads
    only touches this function.
    """
    safe_name = _safe_filename(filename)
    parts = _parts_dir(upload_id)

    if not complete:
        if chunk is None:
            raise HTTPException(status_code=400, detail="Missing chunk")
        if total_chunks is None or chunk_index < 0 or total_chunks < 1 or chunk_index >= total_chunks:
            raise HTTPException(status_code=400, detail="Invalid chunk index")

        parts.mkdir(parents=True, exist_ok=True)
        data = await chunk.read()
        current_size = sum(part.stat().st_size for part in parts.glob("*.part"))
        if current_size + len(data) > settings.max_upload_size:
            _cleanup_parts(upload_id)
            raise HTTPException(status_code=413, detail="File exceeds the 2 GB limit")

        (parts / f"{chunk_index:06d}.part").write_bytes(data)
        return UploadChunkOut(
            upload_id=upload_id,
            received=chunk_index + 1,
            total_chunks=total_chunks,
            complete=False,
        )

    # Finalize: all parts must be present.
    if not parts.is_dir():
        raise HTTPException(status_code=400, detail="No chunks found for this uploadId")
    stored_parts = sorted(parts.glob("*.part"))
    expected_chunks = total_chunks if total_chunks is not None else len(stored_parts)
    if len(stored_parts) != expected_chunks:
        raise HTTPException(
            status_code=400,
            detail=f"Expected {expected_chunks} chunks, found {len(stored_parts)}",
        )

    assembled = parts / "assembled"
    with assembled.open("wb") as target:
        for part in stored_parts:
            with part.open("rb") as source:
                shutil.copyfileobj(source, target)

    file_size = assembled.stat().st_size
    if file_size > settings.max_upload_size:
        _cleanup_parts(upload_id)
        raise HTTPException(status_code=413, detail="File exceeds the 2 GB limit")

    project = Project(
        title=Path(safe_name).stem.replace("_", " ").replace("-", " ").strip() or "Untitled project",
        source="upload",
        duration=0,
        language="auto",
        aspect_ratio="9:16",
        status="processing",
        progress=5,
        step="transcribe",
        file_size=file_size,
        thumbnail="from-sky-500 to-indigo-600",
        settings={"clipLength": 30, "originalFilename": safe_name},
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    try:
        key = f"sources/{project.id}/{safe_name}"
        storage.save_file(key, assembled)
        project.source_path = key
        db.commit()
    except Exception as exc:
        project.status = "failed"
        project.error = f"Could not store upload: {exc}"
        db.commit()
        raise HTTPException(status_code=500, detail="Could not store uploaded file") from exc
    finally:
        _cleanup_parts(upload_id)

    project = _enqueue_and_refresh(db, project)
    return UploadChunkOut(
        upload_id=upload_id,
        received=expected_chunks,
        total_chunks=expected_chunks,
        complete=True,
        project=project,
    )


@router.get("/{project_id}", response_model=ProjectDetailOut)
def get_project(project_id: str, db: Session = Depends(get_db)) -> ProjectDetailOut:
    project = _project_or_404(db, project_id)
    return ProjectDetailOut(project=project, clips=project.clips, transcript=project.transcript)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, db: Session = Depends(get_db)) -> None:
    project = _project_or_404(db, project_id)
    if project.source_path:
        storage.delete(project.source_path)
    db.delete(project)
    db.commit()
