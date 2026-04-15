from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest
from app.crud import user as crud_user
from app.crud import token as crud_token
from app.core import email_service
from app.core.audit import audit_event
from app.core.enums import AuditEvent

router = APIRouter()

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
@audit_event(AuditEvent.PASSWORD_RESET_REQUEST)
async def forgot_password(
    body: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    user = await crud_user.get_user_by_email(db, email=body.email)
    
    if user and user.is_active:
        token = await crud_token.create_password_reset_token(db, user_id=user.id)
        
        background_tasks.add_task(
            email_service.send_password_reset_email,
            email_to=user.email,
            token=token,
            username=user.username
        )
    
    return {"msg": "Si el correo está registrado y activo, se enviará un enlace de recuperación a su bandeja de entrada."}

@router.post("/reset-password", status_code=status.HTTP_200_OK)
@audit_event(AuditEvent.PASSWORD_RESET_SUCCESS)
async def reset_password(
    body: ResetPasswordRequest, 
    db: AsyncSession = Depends(get_db)
):
    user = await crud_token.get_user_by_reset_token(db, token=body.token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El token de recuperación es inválido o ha expirado."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No se puede cambiar la contraseña de una cuenta inactiva."
        )

    await crud_user.update_password(db, db_user=user, new_password=body.new_password)
    await crud_token.delete_reset_token(db, token=body.token)
    await crud_token.revoke_all_sessions_for_user(db, user_id=user.id)
    
    return {"msg": "Contraseña actualizada exitosamente. Todas las sesiones anteriores han sido cerradas."}