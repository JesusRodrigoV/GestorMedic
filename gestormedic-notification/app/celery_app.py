from celery import Celery
from kombu import Queue
from app.config import settings

celery_engine = Celery(
    "notification_engine", broker=settings.redis_url, backend=settings.celery_backend
)

celery_engine.conf.task_queues = (
    Queue("high_priority", routing_key="high.#"),
    Queue("default", routing_key="default.#"),
    Queue("bulk", routing_key="bulk.#"),
)

celery_engine.conf.task_default_queue = "default"
celery_engine.conf.task_default_exchange = "notifications"
celery_engine.conf.task_default_routing_key = "default.notification"

celery_engine.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
