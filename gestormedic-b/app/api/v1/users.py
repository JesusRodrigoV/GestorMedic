from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from typing import List, Dict, Any

from app.db.session import get_db
from app.core.dependencies import get_current_active_user, require_admin_clinica, verify_tenant_access
from app.core.enums import UserRole
from app.schemas.user import UserOut, UserUpdateProfile, UserListResponse
from app.schemas.admin import UserAdminUpdate, UserAdminOut
from app.models.user import User
from app.crud import user as crud_user

router = APIRouter()

@router.get("/me", response_model=UserOut)
async def read_user_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.put("/me", response_model=UserOut)
async def update_user_me(
    payload: UserUpdateProfile,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await crud_user.update_own_profile(
        db, 
        db_user=current_user, 
        user_in=payload
    )

@router.get("/", response_model=UserListResponse)
async def list_users(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: str = Query(None),
    current_user: User = Depends(require_admin_clinica)
):
    stmt = select(User)
    
    if current_user.role.name.upper() != UserRole.SUPERADMIN.value:
        stmt = stmt.where(User.clinic_id == current_user.clinic_id)
    
    if search:
        search_filter = f"%{search}%"
        stmt = stmt.where(
            or_(User.email.ilike(search_filter), User.username.ilike(search_filter))
        )
        
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_result = await db.execute(count_stmt)
    total_users = total_result.scalar() or 0

    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    users = result.scalars().all()
    
    return {
        "items": users,
        "metadata": {
            "total": total_users,
            "skip": skip,
            "limit": limit,
            "total_pages": (total_users + limit - 1) // limit
        }
    }

@router.patch("/{user_id}", response_model=UserAdminOut)
async def admin_update_user(
    user_id: int,
    payload: UserAdminUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin_clinica)
):
    db_user = await crud_user.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if admin.role.name.upper() != UserRole.SUPERADMIN.value and db_user.clinic_id != admin.clinic_id:
        raise HTTPException(status_code=403, detail="No puedes editar usuarios ajenos a tu clínica")

    return await crud_user.admin_update_user(db, db_user=db_user, user_in=payload)

@router.post("/{user_id}/toggle-status")
async def toggle_user_active(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin_clinica)
):
    db_user = await crud_user.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    if admin.role.name.upper() != UserRole.SUPERADMIN.value and db_user.clinic_id != admin.clinic_id:
        raise HTTPException(status_code=403, detail="Permisos insuficientes para esta clínica")

    db_user.is_active = not db_user.is_active
    await db.commit()
    return {"msg": f"Usuario {'activado' if db_user.is_active else 'desactivado'}"}