"""Application configuration loaded from environment variables / .env."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # App
    app_name: str = "ClipForge API"
    version: str = "0.1.0"
    environment: str = "development"
    api_prefix: str = "/api"
    debug: bool = True
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Database
    database_url: str = f"sqlite:///{BACKEND_DIR / 'clipforge.db'}"

    # Storage
    storage_backend: str = "local"  # local | s3
    storage_root: Path = BACKEND_DIR / "storage"
    storage_public_url: str = "http://localhost:8000/media"
    s3_bucket: str | None = None
    s3_region: str = "us-east-1"
    s3_endpoint_url: str | None = None
    s3_access_key_id: str | None = None
    s3_secret_access_key: str | None = None

    # Uploads
    max_upload_size: int = 2 * 1024 * 1024 * 1024  # 2 GB
    upload_chunk_size: int = 5 * 1024 * 1024  # 5 MB

    # Queue
    redis_url: str = "redis://localhost:6379/0"
    celery_task_always_eager: bool = True

    # AI / pipeline
    # Phase 1 runs the pipeline in simulation mode so the API can be exercised
    # without downloading media or loading Whisper. Set to false in Phase 2.
    simulation_mode: bool = True
    seed_demo_data: bool = True
    whisper_model: str = "large-v3"
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
