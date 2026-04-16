import secrets
from fastapi import Response
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.models.user import User
from app.core.security import verify_password
from app.crud.user import get_user_by_email
from app.core.config import settings
from app.core.redis_service import redis_service

async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not user.hashed_password or not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user

async def store_refresh_token(user_id: int, token: str):
    expire_seconds = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    await redis_service.set(
        key=f"refresh_token:{token}",
        value=str(user_id),
        expire=expire_seconds
    )

async def verify_refresh_token_session(token: str) -> Optional[int]:
    user_id = await redis_service.get(f"refresh_token:{token}")
    return int(user_id) if user_id else None

async def revoke_refresh_token(token: str):
    await redis_service.delete(f"refresh_token:{token}")

async def create_2fa_session(user_id: int) -> str:
    temp_token = secrets.token_urlsafe(32)
    expire_seconds = settings.TWO_FACTOR_SESSION_EXPIRE_MINUTES * 60
    
    await redis_service.set(
        key=f"2fa_session:{temp_token}",
        value=str(user_id),
        expire=expire_seconds
    )
    return temp_token

async def verify_2fa_session(temp_token: str) -> Optional[int]:
    user_id = await redis_service.get(f"2fa_session:{temp_token}")
    return int(user_id) if user_id else None

async def delete_2fa_session(temp_token: str):
    await redis_service.delete(f"2fa_session:{temp_token}")

def set_refresh_cookie(response: Response, token: str):
    expires_seconds = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="lax",
        path="/",
        max_age=expires_seconds
    )

def clear_refresh_cookie(response: Response):
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=True,
        samesite="lax",
        path="/"
    )