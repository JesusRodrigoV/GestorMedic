import functools
from fastapi import Request, BackgroundTasks
from app.crud.audit import create_audit_log
from app.core.enums import AuditEvent

def audit_event(event_type: AuditEvent):
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            response = await func(*args, **kwargs)
            
            request: Request = kwargs.get("request")
            db = kwargs.get("db")
            background_tasks: BackgroundTasks = kwargs.get("background_tasks")
            
            user = kwargs.get("current_user")
            user_id = user.id if user else None
            clinic_id = user.clinic_id if user else None
            
            ip_address = request.client.host if request else "0.0.0.0"

            if background_tasks and db:
                background_tasks.add_task(
                    create_audit_log,
                    db=db,
                    event=event_type,
                    user_id=user_id,
                    ip_address=ip_address,
                    clinic_id=clinic_id,
                    details={"path": request.url.path if request else None}
                )
            
            return response
        return wrapper
    return decorator