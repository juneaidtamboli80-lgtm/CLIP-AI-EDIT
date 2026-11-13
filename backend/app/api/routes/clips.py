"""Clip detail, editing, rendering and download endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Clip, RenderJob
from app.schemas import ClipEditIn, ClipEnvelope, RenderIn, RenderOut
from app.storage import storage
from app.workers.tasks import render_clip

router = APIRouter(prefix="/clips", tags=["clips"])


def _clip_or_404(db: Session, clip_id: str) -> Clip:
    clip = db.get(Clip, clip_id)
    if clip is None:
        raise HTTPException(status_code=404, detail="Clip not found")
    return clip


@router.get("/{clip_id}", response_model=ClipEnvelope)
def get_clip(clip_id: str, db: Session = Depends(get_db)) -> ClipEnvelope:
    return ClipEnvelope(clip=_clip_or_404(db, clip_id))


@router.patch("/{clip_id}/edit", response_model=ClipEnvelope)
def edit_clip(clip_id: str, payload: ClipEditIn, db: Session = Depends(get_db)) -> ClipEnvelope:
    clip = _clip_or_404(db, clip_id)

    fields = payload.model_dump(exclude_unset=True)
    for field in ("title", "start", "end", "aspect_ratio", "captions", "status"):
        value = fields.get(field)
        if value is not None:
            setattr(clip, field, value)

    # Unknown keys (caption settings, background, speed, ...) are kept in the
    # clip settings JSON so the editor can round-trip its full state.
    extras = payload.model_extra or {}
    if extras:
        clip.settings = {**(clip.settings or {}), **extras}

    if clip.end <= clip.start:
        raise HTTPException(status_code=422, detail="Clip end must be greater than start")

    db.commit()
    db.refresh(clip)
    return ClipEnvelope(clip=clip)


@router.post("/{clip_id}/render", response_model=RenderOut, status_code=status.HTTP_202_ACCEPTED)
def render(clip_id: str, payload: RenderIn, db: Session = Depends(get_db)) -> RenderOut:
    clip = _clip_or_404(db, clip_id)

    job = RenderJob(
        clip_id=clip.id,
        status="queued",
        settings=payload.model_dump(by_alias=False),
    )
    clip.status = "rendering"
    db.add(job)
    db.commit()
    db.refresh(job)

    try:
        render_clip.delay(job.id)
    except Exception:
        render_clip.apply(args=[job.id])

    db.expire_all()
    job = db.get(RenderJob, job.id)
    return RenderOut(job_id=job.id, status=job.status, clip_id=clip.id)


@router.get("/{clip_id}/download")
def download_clip(
    clip_id: str,
    resolution: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> FileResponse:
    clip = _clip_or_404(db, clip_id)
    job = db.scalars(
        select(RenderJob)
        .where(RenderJob.clip_id == clip.id, RenderJob.status == "completed")
        .order_by(RenderJob.created_at.desc())
    ).first()

    if job is None or not job.output_path:
        raise HTTPException(
            status_code=409,
            detail=(
                "No rendered file available. Phase 1 simulates rendering; "
                "FFmpeg export is implemented in Phase 6."
            ),
        )

    try:
        path = storage.path_for(job.output_path)
    except NotImplementedError as exc:
        raise HTTPException(status_code=501, detail=str(exc)) from exc

    if not path.exists():
        raise HTTPException(status_code=404, detail="Rendered file is missing from storage")

    suffix = f"_{resolution}" if resolution else ""
    return FileResponse(path, media_type="video/mp4", filename=f"{clip.title}{suffix}.mp4")
