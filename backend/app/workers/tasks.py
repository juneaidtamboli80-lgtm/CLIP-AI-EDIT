"""Celery tasks. Phase 1 delegates to the simulated pipeline."""

from __future__ import annotations

import logging

from app.database import SessionLocal
from app.models import Clip, RenderJob, utcnow
from app.services.pipeline import run_pipeline
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="clipforge.process_project", bind=True, max_retries=2)
def process_project(self, project_id: str) -> str:  # noqa: ANN001 - celery binding
    """Download, transcribe and detect highlights for a project."""
    try:
        run_pipeline(project_id)
    except Exception as exc:  # pragma: no cover - retry path
        logger.exception("process_project failed for %s", project_id)
        raise self.retry(exc=exc, countdown=15) from exc
    return project_id


@celery_app.task(name="clipforge.render_clip")
def render_clip(job_id: str) -> str:
    """Render a clip to MP4.

    Phase 6 replaces the body with the FFmpeg command builder (crop, captions,
    loudness normalisation, intro/outro). In simulation mode the job completes
    without producing a media file, which the download endpoint reports.
    """
    db = SessionLocal()
    try:
        job = db.get(RenderJob, job_id)
        if job is None:
            logger.warning("render_clip: job %s not found", job_id)
            return job_id

        job.status = "completed"
        job.completed_at = utcnow()
        job.error = None
        clip = db.get(Clip, job.clip_id)
        if clip is not None:
            clip.status = "ready"
        db.commit()
        return job_id
    finally:
        db.close()
