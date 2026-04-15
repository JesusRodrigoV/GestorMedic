from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.crud import patient_profile as crud_patient
from app.crud import user as crud_user
from app.schemas.patient_profile import PatientProfileOut, PatientProfileUpdate
from app.core.dependencies import (
    get_current_active_user, 
    require_staff, 
    verify_tenant_access
)
from app.models.user import User

router = APIRouter()

@router.get("/me", response_model=PatientProfileOut)
async def get_my_patient_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    profile = await crud_patient.get_patient_by_user_id(db=db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil de paciente no encontrado")
    return profile

@router.put("/me", response_model=PatientProfileOut)
async def update_my_patient_profile(
    profile_in: PatientProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    profile = await crud_patient.get_patient_by_user_id(db=db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil de paciente no encontrado")
        
    return await crud_patient.update_patient(db=db, db_obj=profile, obj_in=profile_in)

@router.get("/{user_id}", response_model=PatientProfileOut)
async def get_patient_profile_by_staff(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    target_user = await crud_user.get_user_by_id(db, user_id=user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    if target_user.clinic_id:
        await verify_tenant_access(clinic_id=target_user.clinic_id, current_user=current_user)

    profile = await crud_patient.get_patient_by_user_id(db=db, user_id=user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El usuario no tiene un perfil de paciente")
        
    return profile

@router.put("/{user_id}", response_model=PatientProfileOut)
async def update_patient_profile_by_staff(
    user_id: int,
    profile_in: PatientProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    target_user = await crud_user.get_user_by_id(db, user_id=user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    if target_user.clinic_id:
        await verify_tenant_access(clinic_id=target_user.clinic_id, current_user=current_user)

    profile = await crud_patient.get_patient_by_user_id(db=db, user_id=user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El usuario no tiene un perfil de paciente")

    return await crud_patient.update_patient(db=db, db_obj=profile, obj_in=profile_in)