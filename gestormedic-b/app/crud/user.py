from sqlalchemy import select, or_, func
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from starlette import status
from typing import List, Optional

from app.models.user import User
from app.models.role import Role
from app.models.associations import ClinicDoctor
from app.schemas.user import UserCreate, AdminUserCreate, AdminUserUpdate, UserUpdateProfile
from app.core.security import get_password_hash
from app.core.enums import UserRole

def _get_visitante_role_id(db: Session) -> int:
    stmt = select(Role).where(Role.name == UserRole.VISITANTE.value)
    role = db.execute(stmt).scalar_one_or_none()
    if not role:
        raise RuntimeError(f"Rol por defecto '{UserRole.VISITANTE.value}' no encontrado")
    return role.id

def get_user(db: Session, user_id: int) -> Optional[User]:
    """Obtiene un usuario por su ID con su rol cargado"""
    stmt = (
        select(User)
        .options(joinedload(User.role))
        .where(User.id == user_id)
    )
    return db.execute(stmt).scalar_one_or_none()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Busca un usuario por email"""
    normalized_email = email.strip().lower()
    stmt = (
        select(User)
        .options(joinedload(User.role))
        .where(User.email == normalized_email)
    )
    return db.execute(stmt).scalar_one_or_none()

def get_users_query(
    db: Session, 
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

def create_public_user(db: Session, user_in: UserCreate, role_name: str = "paciente") -> User:
    if not user_in.password:
        raise HTTPException(status_code=400, detail="La contraseña es obligatoria.")

    stmt = select(Role.id).where(Role.name == role_name)
    role_id = db.execute(stmt).scalar_one_or_none()

    if not role_id:
        role_id = _get_visitante_role_id(db)
        
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
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="El email o usuario ya existen.")
    return user

def create_user_by_google(
    db: Session, 
    email: str, 
    username: str, 
    google_id: str, 
    first_name: Optional[str] = None, 
    last_name: Optional[str] = None
) -> User:
    """Crea un usuario autenticado por Google"""
    role_id = _get_visitante_role_id(db)
    
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
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Esta cuenta de Google ya esta vinculada a otro usuario."
        )
    return user

def create_user_by_admin(db: Session, user_in: AdminUserCreate) -> User:
    if not user_in.password:
        raise HTTPException(status_code=400, detail="Contraseña requerida")
        
    user = User(
        email=user_in.email.strip().lower(),
        username=user_in.username,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        hashed_password=get_password_hash(user_in.password),
        is_active=user_in.is_active,
        role_id=user_in.role_id 
    )
    
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Conflicto: Email o Username ya existen."
        )
    return user

def update_user_by_admin(db: Session, db_user: User, user_in: AdminUserUpdate) -> User:
    """Actualización administrativa"""
    update_data = user_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_user, field, value)

    try:
        db.commit()
        db.refresh(db_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Conflicto al actualizar datos únicos.")
    return db_user

def delete_user_by_admin(db: Session, user_id: int) -> bool:
    """Eliminación física de usuario"""
    user = get_user(db, user_id)
    if not user:
        return False
    
    db.delete(user)
    db.commit()
    return True

def update_own_profile(db: Session, *, db_user: User, user_in: UserUpdateProfile) -> User:
    update_data = user_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if hasattr(db_user, field):
            setattr(db_user, field, value)
        
    try:
        db.add(db_user) 
        db.commit()
        db.refresh(db_user)
    except IntegrityError:
        db.rollback()
       
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="Los datos (email o username) ya están siendo usados por otro usuario."
        )
    return db_user

def update_password(db: Session, db_user: User, new_password: str) -> None:
    """Cambio de contraseña seguro"""
    db_user.hashed_password = get_password_hash(new_password)
    db.commit()