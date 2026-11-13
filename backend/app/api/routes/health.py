"""Health and service metadata endpoints."""

from fastapi import APIRouter

from app.config import settings
from app.schemas import HealthOut

router = APIRouter(tags=["system"])


@router.get("/health", response_model=HealthOut)
def health() -> HealthOut:
    return HealthOut(
        status="ok",
        version=settings.version,
        environment=settings.environment,
        simulation_mode=settings.simulation_mode,
    )
