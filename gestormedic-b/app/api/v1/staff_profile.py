from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.crud import staff_profile as crud_staff
from app.crud import user as crud_user
from app.schemas.staff_profile import StaffProfileOut, StaffProfileUpdate
from app.core.dependencies import (
    get_current_active_user, 
    require_staff, 
    require_admin_clinica,
    verify_tenant_access
)
from app.models.user import User

router = APIRouter()

@router.get("/me", response_model=StaffProfileOut)
def get_my_staff_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):

    profile = crud_staff.get_staff_by_user_id(db=db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil de personal no encontrado")
    return profile

@router.put("/me", response_model=StaffProfileOut)
def update_my_staff_profile(
    profile_in: StaffProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):

    profile = crud_staff.get_staff_by_user_id(db=db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil de personal no encontrado")
        
    return crud_staff.update_staff(db=db, db_obj=profile, obj_in=profile_in)


@router.get("/{user_id}", response_model=StaffProfileOut)
def get_staff_profile_by_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_clinica)
):

    target_user = crud_user.get_user(db=db, user_id=user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    if target_user.clinic_id:
        verify_tenant_access(clinic_id=target_user.clinic_id, current_user=current_user)

    profile = crud_staff.get_staff_by_user_id(db=db, user_id=user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El usuario no tiene un perfil de personal")
        
    return profile

@router.put("/{user_id}", response_model=StaffProfileOut)
def update_staff_profile_by_admin(
    user_id: int,
    profile_in: StaffProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_clinica)
):

    target_user = crud_user.get_user(db=db, user_id=user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    if target_user.clinic_id:
        verify_tenant_access(clinic_id=target_user.clinic_id, current_user=current_user)

    profile = crud_staff.get_staff_by_user_id(db=db, user_id=user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El usuario no tiene un perfil de personal")

    return crud_staff.update_staff(db=db, db_obj=profile, obj_in=profile_in)