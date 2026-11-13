"""Celery application factory."""

from celery import Celery

from app.config import settings

celery_app = Celery(
    "clipforge",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.workers.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=60 * 60,
    task_soft_time_limit=60 * 55,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    # Local development defaults to eager execution so the API works without Redis.
    task_always_eager=settings.celery_task_always_eager,
    task_eager_propagates=False,
)
