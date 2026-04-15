from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from typing import List

from app.db.session import get_db
from app.core.config import settings
from app.models.user import User
from app.core.enums import UserRole
from app.crud import user as crud_user

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="No se pudo validar la sesión.",
    headers={"WWW-Authenticate": "Bearer"},
)

def get_current_user(
    db: Session = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "access":
            raise CREDENTIALS_EXCEPTION
            
        email: str = payload.get("sub")
        if email is None:
            raise CREDENTIALS_EXCEPTION
            
    except (JWTError, AttributeError):
        raise CREDENTIALS_EXCEPTION

    stmt = select(User).where(User.email == email)
    user = db.execute(stmt).scalars().first()
    
    if user is None:
        raise CREDENTIALS_EXCEPTION
        
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Usuario inactivo o suspendido"
        )
    return current_user

def require_role(allowed_roles: List[UserRole]):
    def role_checker(
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        user_role_name = current_user.role.name.lower() if current_user.role else ""
        
        allowed_values = [r.value.lower() for r in allowed_roles]
        superadmin_value = UserRole.SUPERADMIN.value.lower()

        if user_role_name == superadmin_value:
            return current_user
            
        if user_role_name not in allowed_values:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permisos insuficientes. Se requiere uno de: {[r.value for r in allowed_roles]}"
            )
        return current_user
    
    return role_checker

require_superadmin = require_role([UserRole.SUPERADMIN])

require_admin_clinica = require_role([UserRole.ADMIN_CLINICA])

require_doctor = require_role([UserRole.ADMIN_CLINICA, UserRole.MEDICO])

require_staff = require_role([
    UserRole.ADMIN_CLINICA, 
    UserRole.MEDICO, 
    UserRole.RECEPCIONISTA
])

def verify_tenant_access(
    clinic_id: int, 
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role.name.upper() == UserRole.SUPERADMIN.value:
        return True
        
    if current_user.clinic_id != clinic_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Este recurso pertenece a otra clínica."
        )
    return True