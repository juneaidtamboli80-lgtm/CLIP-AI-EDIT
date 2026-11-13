"""Pydantic schemas. Responses use camelCase to match the Next.js client."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


def to_camel(value: str) -> str:
    head, *tail = value.split("_")
    return head + "".join(part.capitalize() for part in tail)


class ApiModel(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )


class TranscriptWord(ApiModel):
    text: str
    start: float
    end: float


class TranscriptCueOut(ApiModel):
    id: str
    start: float
    end: float
    speaker: str
    text: str
    words: list[TranscriptWord] = Field(default_factory=list)


class ClipOut(ApiModel):
    id: str
    project_id: str
    title: str
    start: float
    end: float
    score: float
    reason: str
    thumbnail: str
    status: str
    aspect_ratio: str
    captions: bool
    words: int
    settings: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime | None = None


class ProjectOut(ApiModel):
    id: str
    title: str
    source: str
    source_url: str | None = None
    thumbnail: str
    duration: float
    language: str
    aspect_ratio: str
    status: str
    progress: int
    step: str | None = None
    resolution: str | None = None
    file_size: int | None = None
    error: str | None = None
    clips_count: int = 0
    created_at: datetime | None = None


class ProjectDetailOut(ApiModel):
    project: ProjectOut
    clips: list[ClipOut]
    transcript: list[TranscriptCueOut]


class ProjectListOut(ApiModel):
    projects: list[ProjectOut]


class ProjectEnvelope(ApiModel):
    project: ProjectOut


class ClipEnvelope(ApiModel):
    clip: ClipOut


class UploadChunkOut(ApiModel):
    upload_id: str
    received: int
    total_chunks: int
    complete: bool
    project: ProjectOut | None = None


class YouTubeCreateIn(ApiModel):
    url: str
    language: str = "auto"
    aspect_ratio: str = "9:16"
    clip_length: int = 30
    template_id: str | None = None


class ClipEditIn(ApiModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
        extra="allow",
    )

    title: str | None = None
    start: float | None = None
    end: float | None = None
    aspect_ratio: str | None = None
    captions: bool | None = None
    status: str | None = None


class RenderIn(ApiModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
        extra="allow",
    )

    resolution: str = "1080p"
    fps: int = 30
    format: str = "mp4"
    bitrate: str | None = None


class RenderOut(ApiModel):
    job_id: str
    status: str
    clip_id: str


class SubtitleTranslateIn(ApiModel):
    clip_id: str
    target: str
    source: str | None = None


class SubtitleOut(ApiModel):
    srt: str
    vtt: str
    target: str
    simulated: bool = True


class HealthOut(ApiModel):
    status: str
    version: str
    environment: str
    simulation_mode: bool
