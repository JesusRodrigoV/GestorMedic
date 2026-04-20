from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from typing import List

from app.db.session import get_db
from app.models.user import User
from app.models.notification import Notification
from app.core.dependencies import get_current_active_user
from app.schemas.notification import NotificationOut, NotificationList, NotificationUpdate

router = APIRouter()

@router.get("/me", response_model=NotificationList)
async def get_my_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Obtener notificaciones del usuario actual."""
    # Listado de notificaciones (ultimas 20)
    stmt = select(Notification).where(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(20)
    
    result = await db.execute(stmt)
    notifications = result.scalars().all()
    
    # Conteo de no leidas
    count_stmt = select(func.count(Notification.id)).where(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    )
    unread_result = await db.execute(count_stmt)
    unread_count = unread_result.scalar() or 0
    
    return {
        "items": notifications,
        "unread_count": unread_count
    }

@router.patch("/{notification_id}/read", response_model=NotificationOut)
async def mark_notification_as_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Marcar una notificación como leída."""
    stmt = select(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    )
    result = await db.execute(stmt)
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    
    notification.is_read = True
    await db.commit()
    await db.refresh(notification)
    return notification

@router.post("/mark-all-read")
async def mark_all_as_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Marcar todas las notificaciones como leídas."""
    stmt = update(Notification).where(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).values(is_read=True)
    
    await db.execute(stmt)
    await db.commit()
    return {"message": "Todas las notificaciones marcadas como leídas"}
