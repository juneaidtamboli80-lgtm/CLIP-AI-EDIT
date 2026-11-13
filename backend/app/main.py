"""ClipForge FastAPI application."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import clips, health, projects, subtitles
from app.config import settings
from app.database import SessionLocal, init_db
from app.services.pipeline import seed_demo_project

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("clipforge")


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ANN201 - FastAPI signature
    init_db()
    if settings.seed_demo_data:
        db = SessionLocal()
        try:
            seed_demo_project(db)
        finally:
            db.close()
    logger.info(
        "ClipForge API %s ready (simulation_mode=%s)",
        settings.version,
        settings.simulation_mode,
    )
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description=(
        "Turn long videos into viral vertical clips. Phase 1 exposes the full API "
        "surface with a simulated pipeline; Whisper, yt-dlp and FFmpeg land in later phases."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

settings.storage_root.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(settings.storage_root), check_dir=False), name="media")

app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(projects.router, prefix=settings.api_prefix)
app.include_router(clips.router, prefix=settings.api_prefix)
app.include_router(subtitles.router, prefix=settings.api_prefix)


@app.get("/", tags=["system"])
def root() -> dict[str, str]:
    return {
        "name": settings.app_name,
        "version": settings.version,
        "docs": "/docs",
        "health": f"{settings.api_prefix}/health",
    }
