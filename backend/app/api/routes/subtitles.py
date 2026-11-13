"""Subtitle translation and SRT/VTT export endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Clip, TranscriptCue
from app.schemas import SubtitleOut, SubtitleTranslateIn
from app.services.subtitles import cues_for_clip, to_srt, to_vtt

router = APIRouter(prefix="/subtitles", tags=["subtitles"])


@router.post("/translate", response_model=SubtitleOut)
def translate_subtitles(payload: SubtitleTranslateIn, db: Session = Depends(get_db)) -> SubtitleOut:
    clip = db.get(Clip, payload.clip_id)
    if clip is None:
        raise HTTPException(status_code=404, detail="Clip not found")

    cues = list(
        db.scalars(
            select(TranscriptCue)
            .where(TranscriptCue.project_id == clip.project_id)
            .order_by(TranscriptCue.start)
        ).all()
    )
    selected = cues_for_clip(cues, clip)
    if not selected:
        raise HTTPException(status_code=422, detail="No transcript cues overlap this clip")

    return SubtitleOut(
        srt=to_srt(selected, clip, target=payload.target),
        vtt=to_vtt(selected, clip, target=payload.target),
        target=payload.target,
        simulated=True,
    )
