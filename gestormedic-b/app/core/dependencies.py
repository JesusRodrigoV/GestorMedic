from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from typing import Optional

from app.core.config import settings
from app.db.session import get_db
from app.crud import user as crud_user
from app.models.user import User
from app.core.enums import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autorizado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "access":
            raise credentials_exception
        email = payload.get("sub")
        if not email:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = crud_user.get_user_by_email(db, email)
    if not user:
        raise credentials_exception
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not getattr(current_user, "is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Usuario inactivo"
        )
    return current_user


def _get_user_role_name(user: User) -> str:
    return str(user.role.name if hasattr(user.role, 'name') else user.role).upper()

def require_superadmin(current_user: User = Depends(get_current_active_user)) -> User:
    user_role = _get_user_role_name(current_user)
    if user_role != "SUPERADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permisos insuficientes (SuperAdmin requerido)"
        )
    return current_user

def require_clinic_admin(current_user: User = Depends(get_current_active_user)) -> User:
    user_role = _get_user_role_name(current_user)
    if user_role not in ["SUPERADMIN", "ADMIN_CLINICA"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permisos insuficientes (Administrador de Clínica requerido)"
        )
    return current_user

def require_doctor(current_user: User = Depends(get_current_active_user)) -> User:
    user_role = _get_user_role_name(current_user)
    if user_role not in ["SUPERADMIN", "ADMIN_CLINICA", "MEDICO"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permisos insuficientes (Médico requerido)"
        )
    return current_user

def require_staff(current_user: User = Depends(get_current_active_user)) -> User:
    user_role = _get_user_role_name(current_user)
    if user_role not in ["SUPERADMIN", "ADMIN_CLINICA", "MEDICO", "PERSONAL"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permisos insuficientes (Personal requerido)"
        )
    return current_user


def verify_tenant_access(clinic_id: int, current_user: User = Depends(get_current_active_user)):
    user_role = _get_user_role_name(current_user)
    
    if user_role == "SUPERADMIN":
        return True
        
    if current_user.clinic_id != clinic_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. No perteneces a esta clínica."
        )
    return True