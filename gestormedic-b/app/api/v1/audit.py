from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate

from app.db.session import get_db
from app.crud import audit as crud_audit
from app.schemas.audit import AuditLogOut
from app.core.dependencies import require_clinic_admin, get_current_active_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=Page[AuditLogOut], summary="Obtener logs de auditoría")
def get_audit_logs(
    clinic_id: Optional[int] = Query(None, description="Filtrar por ID de clínica (Solo SuperAdmin)"),
    event_type: Optional[str] = Query(None, description="Filtrar por tipo de evento"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_admin)
):

    user_role = str(current_user.role.name if hasattr(current_user.role, 'name') else current_user.role).upper()
    
    if user_role == "ADMIN_CLINICA":
        target_clinic_id = current_user.clinic_id
    else:
        target_clinic_id = clinic_id

    query = crud_audit.get_audit_logs_query(
        db=db, 
        clinic_id=target_clinic_id,
        event_type=event_type
    )
    
    return paginate(query)