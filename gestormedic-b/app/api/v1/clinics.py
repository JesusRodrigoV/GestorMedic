from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate

from app.db.session import get_db
from app.crud import clinic as crud_clinic
from app.schemas.clinic import ClinicOut, ClinicCreate, ClinicUpdate
from app.core.dependencies import (
    require_superadmin,
    require_admin_clinica,
    verify_tenant_access,
    get_current_active_user
)
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=Page[ClinicOut], dependencies=[Depends(require_superadmin)])
def list_clinics(
    is_active: Optional[bool] = Query(None, description="Filtrar por estado activo/inactivo"),
    search: Optional[str] = Query(None, description="Buscar por nombre o dominio"),
    db: Session = Depends(get_db)
):
    return paginate(crud_clinic.get_clinics_query(db=db, is_active=is_active, search=search))


@router.get("/{clinic_id}", response_model=ClinicOut)
def get_clinic(
    clinic_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_clinica)
):
    verify_tenant_access(clinic_id=clinic_id, current_user=current_user)

    clinic = crud_clinic.get_clinic(db=db, clinic_id=clinic_id)
    if not clinic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clínica no encontrada")
    return clinic


@router.post("/", response_model=ClinicOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_superadmin)])
def create_clinic(clinic_in: ClinicCreate, db: Session = Depends(get_db)):
    existing_clinic = crud_clinic.get_clinic_by_domain(db=db, domain=clinic_in.domain)
    if existing_clinic:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El subdominio ya está en uso")
    
    return crud_clinic.create_clinic(db=db, clinic_in=clinic_in)


@router.put("/{clinic_id}", response_model=ClinicOut)
def update_clinic(
    clinic_id: int, 
    clinic_in: ClinicUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_clinica)
):
    verify_tenant_access(clinic_id=clinic_id, current_user=current_user)

    clinic_db = crud_clinic.get_clinic(db=db, clinic_id=clinic_id)
    if not clinic_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clínica no encontrada")
    
    if clinic_in.domain and clinic_in.domain != clinic_db.domain:
        if crud_clinic.get_clinic_by_domain(db=db, domain=clinic_in.domain):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El subdominio ya está en uso por otra clínica")

    return crud_clinic.update_clinic(db=db, db_clinic_to_update=clinic_db, clinic_in=clinic_in)


@router.delete("/{clinic_id}", response_model=ClinicOut, dependencies=[Depends(require_superadmin)])
def delete_clinic(clinic_id: int, db: Session = Depends(get_db)):
    clinic_db = crud_clinic.get_clinic(db=db, clinic_id=clinic_id)
    if not clinic_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clínica no encontrada")
    
    return crud_clinic.delete_clinic(db=db, clinic_id_to_delete=clinic_id)