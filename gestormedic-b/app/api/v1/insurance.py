from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.crud import insurance_profile as crud_insurance
from app.crud import user as crud_user
from app.schemas.insurance_profile import InsuranceProfileOut, InsuranceProfileUpdate
from app.core.dependencies import (
    get_current_active_user, 
    require_staff, 
    verify_tenant_access
)
from app.models.user import User

router = APIRouter()

@router.get("/me", response_model=InsuranceProfileOut)
def get_my_insurance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    profile = crud_insurance.get_insurance_by_user_id(db=db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Información de seguro no encontrada")
    return profile

@router.put("/me", response_model=InsuranceProfileOut)
def update_my_insurance(
    profile_in: InsuranceProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    profile = crud_insurance.get_insurance_by_user_id(db=db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Información de seguro no encontrada")
        
    return crud_insurance.update_insurance(db=db, db_obj=profile, obj_in=profile_in)


@router.get("/{user_id}", response_model=InsuranceProfileOut)
def get_insurance_by_staff(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    target_user = crud_user.get_user(db=db, user_id=user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    if target_user.clinic_id:
        verify_tenant_access(clinic_id=target_user.clinic_id, current_user=current_user)

    profile = crud_insurance.get_insurance_by_user_id(db=db, user_id=user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El usuario no tiene información de seguro")
        
    return profile

@router.put("/{user_id}", response_model=InsuranceProfileOut)
def update_insurance_by_staff(
    user_id: int,
    profile_in: InsuranceProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    target_user = crud_user.get_user(db=db, user_id=user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    if target_user.clinic_id:
        verify_tenant_access(clinic_id=target_user.clinic_id, current_user=current_user)

    profile = crud_insurance.get_insurance_by_user_id(db=db, user_id=user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El usuario no tiene información de seguro")

    return crud_insurance.update_insurance(db=db, db_obj=profile, obj_in=profile_in)