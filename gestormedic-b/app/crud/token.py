from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from datetime import datetime, timedelta, timezone
import secrets
from typing import Optional
from app.models.token import RefreshToken, PasswordResetToken
from app.models.user import User

async def create_refresh_token_record(
    db: AsyncSession, 
    *, 
    user_id: int, 
    jti: str, 
    expires_at: datetime, 
    device_info: str = "Desconocido"
):
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    db_obj = RefreshToken(
        user_id=user_id,
        jti=jti,
        expires_at=expires_at,
        device_info=device_info,
        is_revoked=False
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def is_refresh_token_valid(db: AsyncSession, jti: str) -> bool:
    now = datetime.now(timezone.utc)
    stmt = select(RefreshToken).where(
        RefreshToken.jti == jti,
        RefreshToken.is_revoked == False,
        RefreshToken.expires_at > now
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none() is not None

async def revoke_refresh_token_by_jti(db: AsyncSession, jti: str, user_id: Optional[int] = None):
    stmt = select(RefreshToken).where(RefreshToken.jti == jti)
    if user_id:
        stmt = stmt.where(RefreshToken.user_id == user_id)
        
    result = await db.execute(stmt)
    db_token = result.scalar_one_or_none()
    
    if db_token:
        db_token.is_revoked = True
        await db.commit()
    return True

async def revoke_all_sessions_for_user(db: AsyncSession, user_id: int):
    await db.execute(delete(RefreshToken).where(RefreshToken.user_id == user_id))
    await db.commit()

async def create_password_reset_token(db: AsyncSession, *, user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await db.execute(delete(PasswordResetToken).where(PasswordResetToken.user_id == user_id))
    
    db_obj = PasswordResetToken(
        user_id=user_id,
        token=token,
        expires_at=expires
    )
    db.add(db_obj)
    await db.commit()
    return token

async def get_user_by_reset_token(db: AsyncSession, token: str) -> Optional[User]:
    now = datetime.now(timezone.utc)
    stmt = (
        select(User)
        .join(PasswordResetToken)
        .where(
            PasswordResetToken.token == token,
            PasswordResetToken.expires_at > now
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def delete_reset_token(db: AsyncSession, token: str):
    await db.execute(delete(PasswordResetToken).where(PasswordResetToken.token == token))
    await db.commit()