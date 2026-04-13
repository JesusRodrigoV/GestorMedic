import redis
from app.core.config import settings

redis_pool = redis.ConnectionPool(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    password=settings.REDIS_PASSWORD,
    decode_responses=True
)

redis_client = redis.Redis(connection_pool=redis_pool)

class RedisService:
    @staticmethod
    def set_token(key: str, value: str, expire_seconds: int):
        """Guarda un token con un tiempo de expiracion"""
        redis_client.setex(key, expire_seconds, value)

    @staticmethod
    def get_token(key: str) -> str:
        """Obtiene un token por su llave"""
        return redis_client.get(key)

    @staticmethod
    def delete_token(key: str):
        """Elimina un token"""
        redis_client.delete(key)

    @staticmethod
    def exists(key: str) -> bool:
        """Verifica si una llave existe"""
        return redis_client.exists(key) > 0

redis_service = RedisService()