from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import List, Optional

from app.models.user import User
from app.models.role import Role
from app.models.associations import ClinicDoctor
from app.schemas.user import UserCreate, AdminUserCreate, AdminUserUpdate, UserUpdateProfile
from app.core.security import get_password_hash
from app.schemas.admin import UserAdminUpdate

async def get_user(db: AsyncSession, user_id: int) -> Optional[User]:
    stmt = (
        select(User)
        .options(joinedload(User.role))
        .where(User.id == user_id)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    normalized_email = email.strip().lower()
    stmt = (
        select(User)
        .options(joinedload(User.role))
        .where(User.email == normalized_email)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

def get_users_query(
    role_id: Optional[int] = None, 
    is_active: Optional[bool] = None,
    clinic_id: Optional[int] = None,
    search: Optional[str] = None
):
    stmt = select(User).options(joinedload(User.role))
    
    if role_id is not None:
        stmt = stmt.where(User.role_id == role_id)
        
    if is_active is not None:
        stmt = stmt.where(User.is_active == is_active)
        
    if clinic_id is not None:
        stmt = stmt.join(User.clinics).where(ClinicDoctor.clinic_id == clinic_id)
        
    if search:
        search_filter = f"%{search}%"
        stmt = stmt.where(
            or_(
                User.username.ilike(search_filter),
                User.email.ilike(search_filter),
                User.first_name.ilike(search_filter),
                User.last_name.ilike(search_filter)
            )
        )
        
    return stmt.order_by(User.id)

async def create_public_user(db: AsyncSession, user_in: UserCreate, role_name: str = "paciente") -> User:
    if not user_in.password:
        raise HTTPException(status_code=400, detail="La contraseña es obligatoria.")

    role_stmt = select(Role.id).where(Role.name == role_name)
    role_result = await db.execute(role_stmt)
    role_id = role_result.scalar_one_or_none()

    if not role_id:
        raise HTTPException(status_code=500, detail=f"Error de configuración: El rol '{role_name}' no existe.")
        
    user = User(
        email=user_in.email.strip().lower(),
        username=user_in.username,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        hashed_password=get_password_hash(user_in.password),
        is_active=True,
        role_id=role_id
    )
    
    db.add(user)
    try:
        await db.commit()
        await db.refresh(user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="El email o usuario ya existen.")
    return user

async def create_user_by_google(
    db: AsyncSession, 
    email: str, 
    username: str, 
    google_id: str, 
    first_name: Optional[str] = None, 
    last_name: Optional[str] = None
) -> User:
    role_stmt = select(Role.id).where(Role.name == "paciente")
    role_result = await db.execute(role_stmt)
    role_id = role_result.scalar_one_or_none()
    
    user = User(
        email=email.strip().lower(),
        username=username,
        first_name=first_name,
        last_name=last_name,
        google_id=google_id,
        hashed_password=None,
        is_active=True,
        role_id=role_id
    )
    
    db.add(user)
    try:
        await db.commit()
        await db.refresh(user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Esta cuenta de Google ya está vinculada a otro usuario."
        )
    return user

async def create_user_by_admin(db: AsyncSession, user_in: AdminUserCreate) -> User:
    user = User(
        email=user_in.email.strip().lower(),
        username=user_in.username,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        hashed_password=get_password_hash(user_in.password) if user_in.password else None,
        is_active=user_in.is_active,
        role_id=user_in.role_id 
    )
    
    db.add(user)
    try:
        await db.commit()
        await db.refresh(user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Conflicto: Email o Username ya existen.")
    return user

async def update_user_by_admin(db: AsyncSession, db_user: User, user_in: AdminUserUpdate) -> User:
    update_data = user_in.model_dump(exclude_unset=True)
    
    if "password" in update_data:
        db_user.hashed_password = get_password_hash(update_data.pop("password"))

    for field, value in update_data.items():
        setattr(db_user, field, value)

    try:
        await db.commit()
        await db.refresh(db_user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Conflicto al actualizar datos únicos.")
    return db_user

async def delete_user_by_admin(db: AsyncSession, user_id: int) -> bool:
    user = await get_user(db, user_id)
    if not user:
        return False
    
    await db.delete(user)
    await db.commit()
    return True

async def update_own_profile(db: AsyncSession, db_user: User, user_in: UserUpdateProfile) -> User:
    update_data = user_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if hasattr(db_user, field):
            setattr(db_user, field, value)
        
    try:
        await db.commit()
        await db.refresh(db_user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Los datos ya están siendo usados.")
    return db_user

async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    return result.scalars().first()

async def admin_update_user(db: AsyncSession, *, db_user: User, user_in: UserAdminUpdate) -> User:
    update_data = user_in.model_dump(exclude_unset=True)
    
    if update_data.get("password"):
        hashed_password = get_password_hash(update_data["password"])
        db_user.hashed_password = hashed_password
        del update_data["password"]

    for field in update_data:
        setattr(db_user, field, update_data[field])

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def enable_2fa(db: AsyncSession, *, user: User, secret: str) -> User:
    user.totp_secret = secret
    user.is_totp_enabled = True
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user