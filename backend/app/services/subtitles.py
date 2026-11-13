"""Subtitle formatting helpers and the Phase 5 translation seam."""

from __future__ import annotations

from app.models import Clip, TranscriptCue


def _format_timestamp(seconds: float, separator: str = ",") -> str:
    milliseconds = max(0, int(round(seconds * 1000)))
    hours, remainder = divmod(milliseconds, 3_600_000)
    minutes, remainder = divmod(remainder, 60_000)
    secs, millis = divmod(remainder, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}{separator}{millis:03d}"


def cues_for_clip(cues: list[TranscriptCue], clip: Clip) -> list[TranscriptCue]:
    """Return cues overlapping the clip range, with times rebased to zero."""
    selected = [cue for cue in cues if cue.end > clip.start and cue.start < clip.end]
    return selected


def _rebased(cue: TranscriptCue, clip: Clip) -> tuple[float, float]:
    return max(0.0, cue.start - clip.start), max(0.0, min(cue.end, clip.end) - clip.start)


def _translate(text: str, target: str) -> str:
    # Phase 5: call the translation model here. For now the output is clearly
    # marked as simulated so nothing pretends to be a real translation.
    return f"[{target}] {text}"


def to_srt(cues: list[TranscriptCue], clip: Clip, target: str | None = None) -> str:
    blocks: list[str] = []
    for index, cue in enumerate(cues, start=1):
        start, end = _rebased(cue, clip)
        text = _translate(cue.text, target) if target else cue.text
        blocks.append(
            f"{index}\n{_format_timestamp(start)} --> {_format_timestamp(end)}\n{text}\n"
        )
    return "\n".join(blocks)


def to_vtt(cues: list[TranscriptCue], clip: Clip, target: str | None = None) -> str:
    blocks: list[str] = ["WEBVTT\n"]
    for cue in cues:
        start, end = _rebased(cue, clip)
        text = _translate(cue.text, target) if target else cue.text
        blocks.append(
            f"{_format_timestamp(start, '.')} --> {_format_timestamp(end, '.')}\n{text}\n"
        )
    return "\n".join(blocks)
