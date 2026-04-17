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
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    sortBy: str = Query("created_at"),
    sortType: str = Query("desc", pattern="^(asc|desc)$"),
    filter: str = Query(None),
    current_user: User = Depends(require_admin_clinica)
):
    stmt = select(User)
    
    if current_user.role.name.upper() != UserRole.SUPERADMIN.value:
        stmt = stmt.where(User.clinic_id == current_user.clinic_id)
    
    if filter:
        search_filter = f"%{filter}%"
        stmt = stmt.where(
            or_(User.email.ilike(search_filter), User.username.ilike(search_filter))
        )

    sort_column_map = {
        "created_at": User.created_at,
        "email": User.email,
        "username": User.username,
        "is_active": User.is_active,
    }
    order_column = sort_column_map.get(sortBy, User.created_at)
    if sortType.lower() == "asc":
        stmt = stmt.order_by(order_column.asc())
    else:
        stmt = stmt.order_by(order_column.desc())
        
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_result = await db.execute(count_stmt)
    total_users = total_result.scalar() or 0

    skip = (page - 1) * pageSize
    stmt = stmt.offset(skip).limit(pageSize)
    result = await db.execute(stmt)
    users = result.scalars().all()
    
    return {
        "items": users,
        "metadata": {
            "total": total_users,
            "page": page,
            "pageSize": pageSize,
            "skip": skip,
            "limit": pageSize,
            "total_pages": (total_users + pageSize - 1) // pageSize
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
    
    is_superadmin = admin.role.name.upper() == UserRole.SUPERADMIN.value
    if not is_superadmin and db_user.clinic_id != admin.clinic_id:
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