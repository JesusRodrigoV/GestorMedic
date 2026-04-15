import redis.asyncio as redis
from app.core.config import settings

class RedisService:
    def __init__(self):
        self.redis = None

    async def init_redis(self):
        self.redis = await redis.from_url(
            settings.REDIS_URL, 
            encoding="utf-8", 
            decode_responses=True
        )

    async def get(self, key: str):
        return await self.redis.get(key)

    async def set(self, key: str, value: str, expire: int = None):
        await self.redis.set(key, value, ex=expire)

    async def delete(self, key: str):
        if self.redis:
            await self.redis.delete(key)

    async def increment(self, key: str):
        return await self.redis.incr(key)

redis_service = RedisService()