from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.schemas import NotificationRequest
from app.database import SessionLocal
from app.models import NotificationRecord
from app.tasks import process_notification
from app.security import verify_internal_token

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
    responses={
        401: {"description": "No autorizado"},
        422: {"description": "Error de validacion"},
    },
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post(
    "/",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Crear notificacion",
    description="Recibe un payload validado, lo persiste en la base de datos y encola la tarea en Celery segun su prioridad.",
)
async def create_notification(
    request: NotificationRequest,
    db: Session = Depends(get_db),
    token_data: dict = Depends(verify_internal_token),
):
    db_record = NotificationRecord(
        user_id=request.user_id,
        event_type=request.event_type,
        status="PENDING",
        payload=request.payload,
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    queue_map = {10: "high_priority", 5: "default", 1: "bulk"}
    target_queue = "default"
    for p, q in sorted(queue_map.items(), reverse=True):
        if request.priority >= p:
            target_queue = q
            break

    process_notification.apply_async(
        args=[db_record.id, request.channels], queue=target_queue
    )

    return {
        "message": "Notification queued",
        "id": db_record.id,
        "priority_assigned": target_queue,
    }
