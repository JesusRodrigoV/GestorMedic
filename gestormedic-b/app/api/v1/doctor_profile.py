from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.crud import doctor_profile as crud_doctor
from app.crud import user as crud_user
from app.crud import specialty as crud_specialty
from app.schemas.doctor_profile import DoctorProfileOut, DoctorProfileUpdate
from app.schemas.specialty import SpecialtyOut
from app.core.dependencies import (
    get_current_active_user, 
    require_doctor, 
    require_clinic_admin,
    verify_tenant_access
)
from app.models.user import User

router = APIRouter()

@router.get("/me", response_model=DoctorProfileOut)
def get_my_doctor_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    profile = crud_doctor.get_doctor_profile_by_user_id(db=db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil de doctor no encontrado")
    return profile

@router.put("/me", response_model=DoctorProfileOut)
def update_my_doctor_profile(
    profile_in: DoctorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):

    profile = crud_doctor.get_doctor_profile_by_user_id(db=db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil de doctor no encontrado")
        
    return crud_doctor.update_doctor_profile(db=db, db_obj=profile, obj_in=profile_in)


@router.post("/me/specialties/{specialty_id}", response_model=DoctorProfileOut)
def add_specialty_to_my_profile(
    specialty_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    profile = crud_doctor.get_doctor_profile_by_user_id(db=db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil de doctor no encontrado")
    
    specialty = crud_specialty.get_specialty(db=db, specialty_id=specialty_id)
    if not specialty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Especialidad no encontrada en el catálogo")

    return crud_doctor.add_specialty_to_doctor(db=db, doctor_profile=profile, specialty=specialty)

@router.delete("/me/specialties/{specialty_id}", response_model=DoctorProfileOut)
def remove_specialty_from_my_profile(
    specialty_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    profile = crud_doctor.get_doctor_profile_by_user_id(db=db, user_id=current_user.id)
    specialty = crud_specialty.get_specialty(db=db, specialty_id=specialty_id)
    
    if not profile or not specialty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil o especialidad no encontrados")

    return crud_doctor.remove_specialty_from_doctor(db=db, doctor_profile=profile, specialty=specialty)



@router.get("/{user_id}", response_model=DoctorProfileOut)
def get_doctor_profile_by_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_admin)
):

    target_user = crud_user.get_user(db=db, user_id=user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    if target_user.clinic_id:
        verify_tenant_access(clinic_id=target_user.clinic_id, current_user=current_user)

    profile = crud_doctor.get_doctor_profile_by_user_id(db=db, user_id=user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El usuario no tiene un perfil de doctor")
        
    return profile

@router.put("/{user_id}", response_model=DoctorProfileOut)
def update_doctor_profile_by_admin(
    user_id: int,
    profile_in: DoctorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_admin)
):

    target_user = crud_user.get_user(db=db, user_id=user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    if target_user.clinic_id:
        verify_tenant_access(clinic_id=target_user.clinic_id, current_user=current_user)

    profile = crud_doctor.get_doctor_profile_by_user_id(db=db, user_id=user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El usuario no tiene un perfil de doctor")

    return crud_doctor.update_doctor_profile(db=db, db_obj=profile, obj_in=profile_in)