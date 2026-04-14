from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from datetime import datetime, timedelta
import secrets

from app.models.token import RefreshToken, PasswordResetToken
from app.models.user import User


def create_refresh_token_record(
    db: Session, 
    *, 
    user_id: int, 
    jti: str, 
    expires_at: datetime, 
    device_info: str = "Desconocido"
):
    """Guarda un registro del refresh token para permitir revocación."""
    db_obj = RefreshToken(
        user_id=user_id,
        jti=jti,
        expires_at=expires_at,
        device_info=device_info,
        is_revoked=False
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def is_refresh_token_valid(db: Session, jti: str) -> bool:
    stmt = select(RefreshToken).where(
        RefreshToken.jti == jti,
        RefreshToken.is_revoked == False,
        RefreshToken.expires_at > datetime.utcnow()
    )
    result = db.execute(stmt).scalar_one_or_none()
    return result is not None

def revoke_refresh_token_by_jti(db: Session, jti: str, user_id: int = None):
    stmt = select(RefreshToken).where(RefreshToken.jti == jti)
    if user_id:
        stmt = stmt.where(RefreshToken.user_id == user_id)
        
    db_token = db.execute(stmt).scalar_one_or_none()
    if db_token:
        db_token.is_revoked = True
        db.commit()
    return True

def revoke_all_sessions_for_user(db: Session, user_id: int):
    db.execute(
        delete(RefreshToken).where(RefreshToken.user_id == user_id)
    )
    db.commit()

def get_active_sessions_for_user(db: Session, user_id: int):
    stmt = select(RefreshToken).where(
        RefreshToken.user_id == user_id,
        RefreshToken.is_revoked == False,
        RefreshToken.expires_at > datetime.utcnow()
    )
    return db.execute(stmt).scalars().all()

def create_password_reset_token(db: Session, *, user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(hours=1)
    
    db.execute(delete(PasswordResetToken).where(PasswordResetToken.user_id == user_id))
    
    db_obj = PasswordResetToken(
        user_id=user_id,
        token=token,
        expires_at=expires
    )
    db.add(db_obj)
    db.commit()
    return token

def get_user_by_reset_token(db: Session, token: str) -> User | None:
    stmt = select(User).join(PasswordResetToken).where(
        PasswordResetToken.token == token,
        PasswordResetToken.expires_at > datetime.utcnow()
    )
    return db.execute(stmt).scalar_one_or_none()

def delete_reset_token(db: Session, token: str):
    db.execute(delete(PasswordResetToken).where(PasswordResetToken.token == token))
    db.commit()