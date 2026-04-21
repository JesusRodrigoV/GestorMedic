from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.models.external import DoctorProfile, Role, User


security = HTTPBearer(auto_error=True)


@dataclass
class CurrentUser:
    id: int
    email: str
    username: str
    clinic_id: int | None
    role_name: str
    doctor_profile_id: int | None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> CurrentUser:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get('type') != 'access':
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token invalido')
        
        email = payload.get('sub')
        role = payload.get('role')
        clinic_id = payload.get('clinic_id')
        doctor_profile_id = payload.get('doctor_profile_id')
        
        if not email:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token invalido')
            
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token invalido') from exc

    return CurrentUser(
        id=payload.get('user_id', 0), 
        email=email,
        username=payload.get('username', email.split('@')[0]),
        clinic_id=clinic_id,
        role_name=(str(role) if role else '').lower(),
        doctor_profile_id=doctor_profile_id,
    )


def require_roles(*allowed: str):
    allowed_set = {role.lower() for role in allowed}

    async def role_guard(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        current_role = current_user.role_name
        
        if current_role == 'superadmin':
            return current_user
        if current_role in allowed_set:
            return current_user
            
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=f'Permisos insuficientes. Rol actual: {current_role}. Requerido: {list(allowed_set)}'
        )

    return role_guard


require_patient = require_roles('paciente')
require_doctor = require_roles('medico', 'admin_clinica')
require_admin = require_roles('admin_clinica')
