from typing import Any, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit import AuditLog

async def log_event(
    db: AsyncSession,
    *,
    event: str,
    user_id: Optional[int] = None,
    attempted_email: Optional[str] = None,
    ip_address: Optional[str] = None,
    clinic_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None
) -> None:
    """
    Registra un evento de auditoría en la tabla centralizada.
    Este método es compatible con el esquema del backend principal.
    """
    try:
        db_log = AuditLog(
            event=event,
            user_id=user_id,
            attempted_email=attempted_email,
            ip_address=ip_address,
            clinic_id=clinic_id,
            details=details or {}
        )
        db.add(db_log)
        await db.flush() # Usamos flush para no comprometer la transacción principal si falla el commit externo
    except Exception as e:
        print(f"ALERTA: Fallo al registrar auditoría en Citas: {e}")
