from celery import Celery
import os

# Connects to the local Redis server running via Docker
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "tripmacha_workers",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
)

# This will automatically look for tasks defined in your scrapers folder
celery_app.autodiscover_tasks(['app.workers.tasks'])