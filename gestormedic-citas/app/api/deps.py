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
    db: AsyncSession = Depends(get_db),
) -> CurrentUser:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get('type') != 'access':
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token invalido')
        email = payload.get('sub')
        if not email:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token invalido')
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token invalido') from exc

    user_stmt = (
        select(User.id, User.email, User.username, User.clinic_id, Role.name)
        .join(Role, Role.id == User.role_id)
        .where(User.email == email)
    )
    user_row = (await db.execute(user_stmt)).first()
    if not user_row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Usuario no encontrado')

    doctor_profile_id = (
        await db.execute(select(DoctorProfile.id).where(DoctorProfile.user_id == user_row.id))
    ).scalar_one_or_none()

    return CurrentUser(
        id=user_row.id,
        email=user_row.email,
        username=user_row.username,
        clinic_id=user_row.clinic_id,
        role_name=(user_row.name or '').lower(),
        doctor_profile_id=doctor_profile_id,
    )


def require_roles(*allowed: str):
    allowed_set = {role.lower() for role in allowed}

    async def role_guard(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role_name == 'superadmin':
            return current_user
        if current_user.role_name not in allowed_set:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Permisos insuficientes')
        return current_user

    return role_guard


require_patient = require_roles('paciente')
require_doctor = require_roles('medico', 'admin_clinica')
require_admin = require_roles('admin_clinica')
