from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.db.redis import redis_service
from app.models.user import User
from app.core.redis_service import redis_service
# Configuración
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 30 
FAILED_ATTEMPTS_TTL = 3600

def _get_redis_key(email: str) -> str:
    return f"failed_login:{email.lower().strip()}"

async def increment_login_failure(email: str):
    """Incrementa fallos y devuelve el total actual"""
    key = _get_redis_key(email)
    count = await redis_service.redis.incr(key)
    await redis_service.redis.expire(key, FAILED_ATTEMPTS_TTL)
    return count

async def get_login_failures(email: str) -> int:
    key = _get_redis_key(email)
    failures = await redis_service.redis.get(key)
    return int(failures) if failures else 0

async def clear_login_failures(email: str):
    await redis_service.delete(f"login_failures:{email}")

def lock_account(db: Session, user: User):
    """Bloquea físicamente la cuenta en la DB"""
    lock_until = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
    user.locked_until = lock_until
    db.commit()

def is_account_locked(user: User) -> bool:
    """Verifica si el tiempo de bloqueo sigue vigente"""
    if not user.locked_until:
        return False
    return user.locked_until.replace(tzinfo=timezone.utc) > datetime.now(timezone.utc)
