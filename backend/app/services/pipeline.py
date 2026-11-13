"""Pipeline orchestration.

Phase 1 runs in simulation mode: the heavy lifting (yt-dlp download, Whisper
transcription, LLM highlight scoring, FFmpeg rendering) is replaced with
deterministic demo data so the API and UI can be wired end-to-end. Each
function has a clear Phase 2 seam where the real implementation lands.
"""

from __future__ import annotations

import logging
import math
import random

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal
from app.models import Clip, Project, TranscriptCue

logger = logging.getLogger(__name__)

GRADIENTS = [
    "from-violet-500 to-blue-500",
    "from-fuchsia-500 to-rose-500",
    "from-amber-500 to-orange-600",
    "from-emerald-500 to-teal-600",
    "from-sky-500 to-indigo-600",
]

DEMO_LINES = [
    ("Speaker 1", "The biggest mistake creators make is publishing without a hook."),
    ("Speaker 1", "You have about three seconds before someone decides to scroll past."),
    ("Speaker 2", "So the first frame has to earn attention. Say the outcome, not the setup."),
    ("Speaker 1", "Here is the framework I use for every single video I ship."),
    ("Speaker 2", "Dekho, agar aapka pehla second boring hai, log turant scroll kar denge."),
    ("Speaker 1", "Lead with the result, then show the proof, then explain the method."),
    ("Speaker 2", "That is why we cut the intro and start with the most surprising line."),
    ("Speaker 1", "One long podcast can become ten short clips without losing the story."),
    ("Speaker 2", "Keep captions tight, keep the crop on the speaker, and cut the dead air."),
    ("Speaker 1", "Do that for thirty days and your retention curve will look completely different."),
]

CLIP_TEMPLATES = [
    ("The 3-second hook rule that changes everything", 94, "Strong opening claim with a clear payoff in the first sentence."),
    ("Stop starting your videos like this", 88, "Contrarian hook plus a concrete fix — high comment potential."),
    ("The framework behind 10 clips from 1 video", 84, "Actionable framework with a numbered structure and a clean ending."),
    ("Why your first second decides everything", 79, "Direct address, simple language and a relatable pain point."),
    ("Cut the intro, keep the story", 73, "Punchy editing lesson with a memorable one-liner."),
]


def _make_words(text: str, start: float, end: float) -> list[dict[str, object]]:
    tokens = text.split()
    if not tokens:
        return []
    step = max((end - start) / len(tokens), 0.05)
    return [
        {"text": token, "start": round(start + index * step, 2), "end": round(start + (index + 1) * step, 2)}
        for index, token in enumerate(tokens)
    ]


def _demo_transcript(duration: float) -> list[dict[str, object]]:
    cues: list[dict[str, object]] = []
    cursor = 2.0
    for index, (speaker, text) in enumerate(DEMO_LINES):
        length = max(2.5, len(text.split()) / 2.6)
        end = min(cursor + length, duration)
        cues.append(
            {
                "start": round(cursor, 2),
                "end": round(end, 2),
                "speaker": speaker,
                "text": text,
                "words": _make_words(text, cursor, end),
            }
        )
        cursor = end + 0.6
        if cursor >= duration - 3:
            break
    return cues


def simulate_analysis(db: Session, project: Project) -> None:
    """Fill a project with demo clips and a transcript, then mark it ready."""
    if not project.duration:
        project.duration = 900.0
    duration = project.duration
    rng = random.Random(project.id)

    project.clips.clear()
    project.transcript.clear()
    db.flush()

    for cue in _demo_transcript(duration):
        project.transcript.append(TranscriptCue(**cue))

    clip_duration = float(project.settings.get("clipLength", 30)) if project.settings else 30.0
    clip_duration = min(max(clip_duration, 15.0), 60.0)
    start = 3.0
    count = min(len(CLIP_TEMPLATES), max(3, int(duration // 180) + 2))

    for index in range(count):
        title, base_score, reason = CLIP_TEMPLATES[index % len(CLIP_TEMPLATES)]
        end = min(start + clip_duration, duration)
        if end - start < 8:
            break
        project.clips.append(
            Clip(
                title=title,
                start=round(start, 2),
                end=round(end, 2),
                score=round(min(99.0, base_score + rng.uniform(-3, 3)), 1),
                reason=reason,
                thumbnail=GRADIENTS[index % len(GRADIENTS)],
                status="ready",
                aspect_ratio=project.aspect_ratio,
                captions=True,
                words=len(reason.split()) * 12,
            )
        )
        start = end + rng.uniform(45, 120)

    project.status = "ready"
    project.progress = 100
    project.step = "render"
    project.resolution = project.resolution or "1080p"
    project.error = None
    db.commit()


def run_pipeline(project_id: str) -> None:
    """Entry point used by the Celery task and the eager dev fallback."""
    db = SessionLocal()
    try:
        project = db.get(Project, project_id)
        if project is None:
            logger.warning("Pipeline: project %s not found", project_id)
            return

        if not settings.simulation_mode:
            # Phase 2: download -> transcribe -> score -> crop.
            raise NotImplementedError(
                "Real pipeline is not implemented yet. Keep SIMULATION_MODE=true for Phase 1."
            )

        project.status = "processing"
        project.step = "transcribe"
        project.progress = 20
        db.commit()

        simulate_analysis(db, project)
        logger.info("Pipeline: simulated analysis for %s", project_id)
    except Exception as exc:  # pragma: no cover - defensive
        logger.exception("Pipeline failed for %s", project_id)
        project = db.get(Project, project_id)
        if project is not None:
            project.status = "failed"
            project.error = str(exc)[:500]
            db.commit()
        raise
    finally:
        db.close()


def enqueue_project(project_id: str) -> None:
    """Send a project to Celery, falling back to inline execution in dev."""
    from app.workers.tasks import process_project

    try:
        process_project.delay(project_id)
    except Exception as exc:
        logger.warning("Celery unavailable (%s); running pipeline inline", exc)
        process_project.apply(args=[project_id])


def seed_demo_project(db: Session) -> None:
    """Create one ready project so the API is useful on a fresh database."""
    if db.scalar(select(Project.id).limit(1)) is not None:
        return

    project = Project(
        title="How to grow a creator business in 2026",
        source="youtube",
        source_url="https://www.youtube.com/watch?v=demo",
        duration=1872,
        language="en",
        aspect_ratio="9:16",
        status="processing",
        settings={"clipLength": 30},
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    simulate_analysis(db, project)


def estimate_clips(duration: float) -> int:
    """Rough clip count used in UI copy before analysis completes."""
    if duration <= 0:
        return 0
    return max(3, math.ceil(duration / 240))
