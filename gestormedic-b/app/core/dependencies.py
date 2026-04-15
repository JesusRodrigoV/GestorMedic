from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from typing import List

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.core.enums import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(
    db: Session = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar la sesión.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "access":
            raise credentials_exception
            
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # SQLAlchemy 2.0 syntax
    stmt = select(User).where(User.email == email)
    user = db.execute(stmt).scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
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
        if current_user.role == UserRole.SUPERADMIN:
            return current_user
            
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permisos insuficientes. Se requiere uno de los siguientes roles: {[r.value for r in allowed_roles]}"
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

    if current_user.role == UserRole.SUPERADMIN:
        return True
        
    if current_user.clinic_id != clinic_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Este recurso pertenece a otra clínica."
        )
    return True