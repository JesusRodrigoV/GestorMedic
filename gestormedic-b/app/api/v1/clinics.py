from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import select

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
from app.models.clinic import Clinic 

router = APIRouter()

@router.get("/", response_model=Page[ClinicOut], dependencies=[Depends(require_superadmin)])
async def list_clinics(
    is_active: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(Clinic)
    if is_active is not None:
        query = query.where(Clinic.is_active == is_active)
    
    return await paginate(db, query)


@router.get("/{clinic_id}", response_model=ClinicOut)
async def get_clinic(
    clinic_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    await verify_tenant_access(clinic_id=clinic_id, current_user=current_user)

    clinic = await crud_clinic.get_clinic(db=db, clinic_id=clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    return clinic


@router.post("/", response_model=ClinicOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_superadmin)])
async def create_clinic(clinic_in: ClinicCreate, db: AsyncSession = Depends(get_db)):
    existing_nit = await crud_clinic.get_clinic_by_nit(db=db, nit_ruc=clinic_in.nit_ruc)
    if existing_nit:
        raise HTTPException(status_code=400, detail="El NIT/RUC ya se encuentra registrado")
    
    #existing_domain = await crud_clinic.get_clinic_by_domain(db=db, domain=clinic_in.domain)
    #if existing_domain:
    #    raise HTTPException(status_code=400, detail="El subdominio ya está en uso")
    
    return await crud_clinic.create_clinic(db=db, clinic_in=clinic_in)

@router.post("/onboarding", response_model=ClinicOut, status_code=status.HTTP_201_CREATED)
async def onboarding_clinic(
    clinic_in: ClinicCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    existing_nit = await crud_clinic.get_clinic_by_nit(db=db, nit_ruc=clinic_in.nit_ruc)
    if existing_nit:
        raise HTTPException(status_code=400, detail="El NIT/RUC ya se encuentra registrado")
        
    new_clinic = await crud_clinic.create_clinic(db=db, clinic_in=clinic_in)
    
    current_user.clinic_id = new_clinic.id
    current_user.role_id = 2
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    
    return new_clinic


@router.put("/{clinic_id}", response_model=ClinicOut)
async def update_clinic(
    clinic_id: int, 
    clinic_in: ClinicUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_clinica)
):
    await verify_tenant_access(clinic_id=clinic_id, current_user=current_user)

    clinic_db = await crud_clinic.get_clinic(db=db, clinic_id=clinic_id)
    if not clinic_db:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    
    return await crud_clinic.update_clinic(
        db=db, 
        db_clinic=clinic_db,
        clinic_in=clinic_in
    )


@router.delete("/{clinic_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_superadmin)])
async def delete_clinic(clinic_id: int, db: AsyncSession = Depends(get_db)):
    clinic_db = await crud_clinic.get_clinic(db=db, clinic_id=clinic_id)
    if not clinic_db:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    
    await crud_clinic.delete_clinic(db=db, clinic_id_to_delete=clinic_id)
    return None