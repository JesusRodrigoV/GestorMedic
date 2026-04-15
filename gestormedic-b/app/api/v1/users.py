from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, or_
from typing import List

from app.db.session import get_db
from app.core.dependencies import get_current_active_user, require_superadmin, require_admin_clinica
from app.core.enums import UserRole
from app.schemas.user import UserOut, UserUpdateProfile
from app.schemas.admin import UserAdminUpdate, UserAdminOut
from app.models.user import User
from app.crud import user as crud_user

router = APIRouter()


@router.get("/me", response_model=UserOut)
def read_user_me(current_user: User = Depends(get_current_active_user)):
    return current_user



@router.put("/me", response_model=UserOut)
def update_user_me(
    payload: UserUpdateProfile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return crud_user.update_own_profile(db, db_user_to_update=current_user, user_in=payload)


@router.get("/", response_model=List[UserAdminOut])
def list_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    search: str = Query(None),
    current_user: User = Depends(require_superadmin)
):

    stmt = select(User)
    
    if current_user.role != UserRole.SUPERADMIN:
        stmt = stmt.where(User.clinic_id == current_user.clinic_id)
    
    if search:
        search_filter = f"%{search}%"
        stmt = stmt.where(or_(User.email.ilike(search_filter), User.username.ilike(search_filter)))
        
    users = db.execute(stmt.offset(skip).limit(limit)).scalars().all()
    return users

@router.patch("/{user_id}", response_model=UserAdminOut)
def admin_update_user(
    user_id: int,
    payload: UserAdminUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_clinica)
):
    db_user = crud_user.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if admin.role != UserRole.SUPERADMIN and db_user.clinic_id != admin.clinic_id:
        raise HTTPException(status_code=403, detail="No puedes editar usuarios ajenos a tu clinica")

    return crud_user.admin_update_user(db, db_user=db_user, user_in=payload)

@router.post("/{user_id}/toggle-status")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_clinica)
):
    db_user = crud_user.get_user_by_id(db, user_id)
    db_user.is_active = not db_user.is_active
    db.commit()
    return {"msg": f"Usuario {'activado' if db_user.is_active else 'desactivado'}"}