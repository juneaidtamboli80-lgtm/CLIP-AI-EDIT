"""Database models for projects, clips, transcripts and render jobs."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("prj"))
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    source: Mapped[str] = mapped_column(String(20), nullable=False, default="youtube")
    source_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    thumbnail: Mapped[str] = mapped_column(String(300), default="from-violet-500 to-blue-500")
    duration: Mapped[float] = mapped_column(Float, default=0)
    language: Mapped[str] = mapped_column(String(20), default="auto")
    aspect_ratio: Mapped[str] = mapped_column(String(10), default="9:16")
    status: Mapped[str] = mapped_column(String(20), default="draft")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    step: Mapped[str | None] = mapped_column(String(20), nullable=True)
    resolution: Mapped[str | None] = mapped_column(String(20), nullable=True)
    file_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    settings: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    clips: Mapped[list[Clip]] = relationship(
        back_populates="project", cascade="all, delete-orphan", order_by="Clip.start"
    )
    transcript: Mapped[list[TranscriptCue]] = relationship(
        back_populates="project", cascade="all, delete-orphan", order_by="TranscriptCue.start"
    )

    @property
    def clips_count(self) -> int:
        return len(self.clips)


class Clip(Base):
    __tablename__ = "clips"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("clip"))
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    start: Mapped[float] = mapped_column(Float, default=0)
    end: Mapped[float] = mapped_column(Float, default=0)
    score: Mapped[float] = mapped_column(Float, default=0)
    reason: Mapped[str] = mapped_column(Text, default="")
    thumbnail: Mapped[str] = mapped_column(String(300), default="from-violet-500 to-blue-500")
    status: Mapped[str] = mapped_column(String(20), default="draft")
    aspect_ratio: Mapped[str] = mapped_column(String(10), default="9:16")
    captions: Mapped[bool] = mapped_column(Boolean, default=True)
    words: Mapped[int] = mapped_column(Integer, default=0)
    settings: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    project: Mapped[Project] = relationship(back_populates="clips")
    renders: Mapped[list[RenderJob]] = relationship(
        back_populates="clip", cascade="all, delete-orphan", order_by="RenderJob.created_at.desc()"
    )


class TranscriptCue(Base):
    __tablename__ = "transcript_cues"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("cue"))
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    start: Mapped[float] = mapped_column(Float, default=0)
    end: Mapped[float] = mapped_column(Float, default=0)
    speaker: Mapped[str] = mapped_column(String(80), default="Speaker 1")
    text: Mapped[str] = mapped_column(Text, default="")
    words: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)

    project: Mapped[Project] = relationship(back_populates="transcript")


class RenderJob(Base):
    __tablename__ = "render_jobs"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("job"))
    clip_id: Mapped[str] = mapped_column(ForeignKey("clips.id", ondelete="CASCADE"), index=True)
    status: Mapped[str] = mapped_column(String(20), default="queued")
    settings: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    output_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    clip: Mapped[Clip] = relationship(back_populates="renders")
