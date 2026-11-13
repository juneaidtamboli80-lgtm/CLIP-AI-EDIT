"""Storage abstraction: local disk now, S3-compatible object storage later."""

from __future__ import annotations

import shutil
from abc import ABC, abstractmethod
from pathlib import Path

from app.config import settings


class Storage(ABC):
    """Minimal storage interface used by uploads and renders."""

    @abstractmethod
    def path_for(self, key: str) -> Path:
        """Return a local path for a key (used by FFmpeg and FileResponse)."""

    @abstractmethod
    def save_bytes(self, key: str, data: bytes) -> str:
        """Persist bytes and return the storage key."""

    @abstractmethod
    def save_file(self, key: str, source: Path) -> str:
        """Move/copy an existing file into storage and return the key."""

    @abstractmethod
    def delete(self, key: str) -> None: ...

    @abstractmethod
    def exists(self, key: str) -> bool: ...

    @abstractmethod
    def url(self, key: str) -> str:
        """Public URL for a stored object."""


class LocalStorage(Storage):
    def __init__(self, root: Path) -> None:
        self.root = root.resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    def _safe_path(self, key: str) -> Path:
        candidate = (self.root / key).resolve()
        if candidate != self.root and self.root not in candidate.parents:
            raise ValueError(f"Invalid storage key: {key}")
        return candidate

    def path_for(self, key: str) -> Path:
        return self._safe_path(key)

    def save_bytes(self, key: str, data: bytes) -> str:
        target = self._safe_path(key)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        return key

    def save_file(self, key: str, source: Path) -> str:
        target = self._safe_path(key)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(source), str(target))
        return key

    def delete(self, key: str) -> None:
        target = self._safe_path(key)
        if target.is_file():
            target.unlink()
        elif target.is_dir():
            shutil.rmtree(target, ignore_errors=True)

    def exists(self, key: str) -> bool:
        return self._safe_path(key).exists()

    def url(self, key: str) -> str:
        return f"{settings.storage_public_url.rstrip('/')}/{key.lstrip('/')}"


class S3Storage(Storage):
    """S3-compatible adapter. Wired up when credentials are provided in Phase 2."""

    def __init__(self) -> None:
        try:
            import boto3  # type: ignore[import-not-found]
        except ImportError as exc:  # pragma: no cover - optional dependency
            raise RuntimeError(
                "S3 storage requires boto3. Install it with `pip install boto3`."
            ) from exc

        if not settings.s3_bucket:
            raise RuntimeError("S3_BUCKET must be set when STORAGE_BACKEND=s3")

        self.bucket = settings.s3_bucket
        self.client = boto3.client(
            "s3",
            region_name=settings.s3_region,
            endpoint_url=settings.s3_endpoint_url,
            aws_access_key_id=settings.s3_access_key_id,
            aws_secret_access_key=settings.s3_secret_access_key,
        )

    def path_for(self, key: str) -> Path:
        raise NotImplementedError("S3 storage does not expose local paths; download to a temp file first.")

    def save_bytes(self, key: str, data: bytes) -> str:
        self.client.put_object(Bucket=self.bucket, Key=key, Body=data)
        return key

    def save_file(self, key: str, source: Path) -> str:
        self.client.upload_file(str(source), self.bucket, key)
        source.unlink(missing_ok=True)
        return key

    def delete(self, key: str) -> None:
        self.client.delete_object(Bucket=self.bucket, Key=key)

    def exists(self, key: str) -> bool:
        try:
            self.client.head_object(Bucket=self.bucket, Key=key)
            return True
        except Exception:  # pragma: no cover - botocore error types vary
            return False

    def url(self, key: str) -> str:
        return self.client.generate_presigned_url(
            "get_object", Params={"Bucket": self.bucket, "Key": key}, ExpiresIn=3600
        )


def get_storage() -> Storage:
    if settings.storage_backend == "s3":
        return S3Storage()
    return LocalStorage(settings.storage_root)


storage = get_storage()
