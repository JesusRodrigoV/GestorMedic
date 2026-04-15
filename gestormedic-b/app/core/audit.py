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
            user_info = kwargs.get("token_data") or kwargs.get("current_user")
            
            if background_tasks and db and user_info:
                u_id = getattr(user_info, 'id', None) or user_info.get("sub")
                c_id = getattr(user_info, 'clinic_id', None) or user_info.get("clinic_id")
                
                ip = request.client.host if request else "unknown"
                path = str(request.url.path) if request else "unknown"

                background_tasks.add_task(
                    create_audit_log,
                    db=db,
                    event=event_type,
                    user_id=u_id,
                    clinic_id=c_id,
                    ip_address=ip,
                    details={"path": path}
                )
            
            return response
        return wrapper
    return decorator