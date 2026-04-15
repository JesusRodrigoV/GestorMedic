from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.redis_service import redis_service
from app.models.user import User

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_SECONDS = 1800
FAILED_ATTEMPTS_TTL = 3600

def _get_redis_key(email: str) -> str:
    return f"login_failures:{email.lower().strip()}"

async def increment_login_failure(email: str) -> int:
    key = _get_redis_key(email)
    count = await redis_service.increment(key)
    if count == 1:
        await redis_service.expire(key, FAILED_ATTEMPTS_TTL)
    return count

async def get_login_failures(email: str) -> int:
    failures = await redis_service.get(_get_redis_key(email))
    return int(failures) if failures else 0

async def clear_login_failures(email: str):
    await redis_service.delete(_get_redis_key(email))

async def is_account_locked(user: User, email: str) -> bool:

    now = datetime.now(timezone.utc)

    if user.locked_until:
        lock_dt = user.locked_until
        if lock_dt.tzinfo is None:
            lock_dt = lock_dt.replace(tzinfo=timezone.utc)
        
        if lock_dt > now:
            return True

    failures = await get_login_failures(email)
    if failures >= MAX_FAILED_ATTEMPTS:
        return True

    return False

async def lock_account_temporary(email: str):
    await redis_service.expire(_get_redis_key(email), LOCKOUT_DURATION_SECONDS)

async def lock_account_db(db: AsyncSession, user: User, minutes: int = 60):
    lock_until = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    user.locked_until = lock_until