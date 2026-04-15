import redis.asyncio as redis
from app.core.config import settings

class RedisService:
    def __init__(self):
        self.redis: redis.Redis | None = None

    async def init_redis(self):
        try:
            self.redis = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )
            await self.ping()
            print("Conectado a Redis exitosamente (Async)")
        except Exception as e:
            print(f"Error fatal: No se pudo conectar a Redis en {settings.REDIS_URL}")
            print(f"Detalle: {e}")

    async def close_redis(self):
        if self.redis:
            await self.redis.aclose()

    async def ping(self) -> bool:
        if not self.redis:
            return False
        try:
            return await self.redis.ping()
        except Exception:
            return False

    async def get(self, key: str) -> str | None:
        if not self.redis: return None
        return await self.redis.get(key)

    async def set(self, key: str, value: str, expire: int | None = None):
        if not self.redis: return
        await self.redis.set(key, value, ex=expire)

    async def delete(self, key: str):
        if self.redis:
            await self.redis.delete(key)

    async def exists(self, key: str) -> bool:
        if not self.redis: return False
        return await self.redis.exists(key) > 0

    async def increment(self, key: str) -> int:
        if not self.redis: return 0
        return await self.redis.incr(key)

    async def expire(self, key: str, time: int):
        if self.redis:
            await self.redis.expire(key, time)

redis_service = RedisService()