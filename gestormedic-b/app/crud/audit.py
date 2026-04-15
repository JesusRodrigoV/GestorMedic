from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any
from app.models.audit_log import AuditLog
from app.core.enums import AuditEvent

async def create_audit_log(
    db: AsyncSession,
    *,
    event: AuditEvent,
    user_id: Optional[int] = None,
    attempted_email: Optional[str] = None,
    ip_address: Optional[str] = None,
    clinic_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None
) -> None:
    try:
        email_to_log = attempted_email.lower().strip() if attempted_email else None
        
        db_log = AuditLog(
            event=event.value if hasattr(event, 'value') else event,
            user_id=user_id,
            attempted_email=email_to_log,
            ip_address=ip_address,
            clinic_id=clinic_id,
            details=details or {}
        )
        
        db.add(db_log)
        await db.commit()
    except Exception as e:
        await db.rollback()
        print(f" ERROR CRÍTICO EN AUDITORÍA: {e}")

def get_audit_logs_query(
    clinic_id: Optional[int] = None, 
    event_type: Optional[str] = None
):
    stmt = select(AuditLog)
    if clinic_id:
        stmt = stmt.where(AuditLog.clinic_id == clinic_id)
    if event_type:
        stmt = stmt.where(AuditLog.event == event_type)
        
    return stmt.order_by(AuditLog.timestamp.desc())