from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings


client = AsyncIOMotorClient(settings.MONGODB_URI)
database: AsyncIOMotorDatabase = client[settings.MONGODB_DB_NAME]


def get_mongo_db() -> AsyncIOMotorDatabase:
    return database
