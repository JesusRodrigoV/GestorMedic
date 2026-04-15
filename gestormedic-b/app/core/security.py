from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
import uuid
from fastapi import HTTPException, status
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(
    subject: str, 
    role: str, 
    clinic_id: Optional[int] = None, 
    expires_minutes: int | None = None
) -> str:
    now = datetime.now(timezone.utc)
    expires = now + timedelta(minutes=(expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    
    payload = {
        "sub": str(subject),
        "iat": now,
        "exp": expires,
        "role": role,\
        "clinic_id": clinic_id,\
        "type": "access"
    }
    
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(subject: str, expires_days: int | None = None) -> dict:
    now = datetime.now(timezone.utc)
    expires = now + timedelta(days=(expires_days or settings.REFRESH_TOKEN_EXPIRE_DAYS))
    jti = str(uuid.uuid4())
    
    payload = {
        "sub": str(subject),
        "iat": now,
        "exp": expires,
        "jti": jti,
        "type": "refresh"
    }
    
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return {"token": token, "jti": jti, "expires_at": expires}

def create_2fa_token(subject: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(subject),
        "iat": now,
        "exp": now + timedelta(minutes=5),
        "type": "2fa_pending" 
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token ha expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo validar el token",
            headers={"WWW-Authenticate": "Bearer"},
        )