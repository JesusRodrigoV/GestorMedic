from sqlalchemy.orm import Session
from redis.asyncio import Redis
from datetime import datetime, timedelta, timezone
from app.db.session import SessionLocal
from app.models.user import User

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 30 
FAILED_ATTEMPTS_TTL_SECONDS = 3600

FAILED_LOGIN_PREFIX = "failed_login:"
ACCOUNT_LOCK_PREFIX = "account_locked:"

def _get_failed_key(email: str) -> str:
    return f"{FAILED_LOGIN_PREFIX}{email.lower().strip()}"

def _get_lock_key(email: str) -> str:
    return f"{ACCOUNT_LOCK_PREFIX}{email.lower().strip()}"

async def increment_login_failure(email: str, cache: Redis):
    if not cache: return
    key = _get_failed_key(email)
    async with cache.pipeline() as pipe:
        await pipe.incr(key)
        await pipe.expire(key, FAILED_ATTEMPTS_TTL_SECONDS)
        await pipe.execute()

async def get_login_failures(email: str, cache: Redis) -> int:
    if not cache: return 0
    key = _get_failed_key(email)
    failures = await cache.get(key)
    return int(failures) if failures else 0

async def clear_login_failures(email: str, cache: Redis):
    if not cache: return
    await cache.delete(_get_failed_key(email))
    await cache.delete(_get_lock_key(email))

async def lock_account(email: str, cache: Redis):
    if not cache: return
    lock_key = _get_lock_key(email)
    await cache.set(lock_key, "locked", ex=LOCKOUT_DURATION_MINUTES * 60)

async def is_account_locked(email: str, cache: Redis) -> bool:
    if not cache: return False
    lock_key = _get_lock_key(email)
    is_locked = await cache.get(lock_key)
    return is_locked is not None