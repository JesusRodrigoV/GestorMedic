from dataclasses import dataclass

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.postgres import get_db
from app.models.external import DoctorProfile, Role, User


security = HTTPBearer(auto_error=True)


@dataclass
class CurrentUser:
    id: int
    email: str
    username: str
    role_name: str
    doctor_profile_id: int | None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> CurrentUser:
    try:
        payload = decode_access_token(credentials.credentials)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token invalido') from exc

    email = payload.get('sub')
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token invalido')

    user_row = (
        await db.execute(
            select(User.id, User.email, User.username, Role.name)
            .join(Role, Role.id == User.role_id)
            .where(User.email == email)
        )
    ).first()
    if not user_row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Usuario no encontrado')

    doctor_profile_id = (
        await db.execute(select(DoctorProfile.id).where(DoctorProfile.user_id == user_row.id))
    ).scalar_one_or_none()

    return CurrentUser(
        id=user_row.id,
        email=user_row.email,
        username=user_row.username,
        role_name=(str(user_row.name).lower() if user_row.name else ''),
        doctor_profile_id=doctor_profile_id,
    )


def require_roles(*roles: str):
    allowed = {r.lower() for r in roles}

    async def guard(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role_name == 'superadmin':
            return current_user
        if current_user.role_name not in allowed:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Permisos insuficientes')
        return current_user

    return guard


require_patient = require_roles('paciente')
require_doctor = require_roles('medico', 'admin_clinica')


async def require_internal_key(x_internal_key: str = Header(default='')):
    if x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Internal key invalida')
