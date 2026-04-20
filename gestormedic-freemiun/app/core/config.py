from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    DATABASE_URL: str = 'postgresql+asyncpg://postgres:admin@gm-backend-db:5432/gestormedic_db'
    SECRET_KEY: str = 'change-me-in-production'
    ALGORITHM: str = 'HS256'
    API_V1_STR: str = '/api/v1'
    CORS_ORIGINS: str = 'http://localhost:4200'

    @property
    def cors_origins_list(self) -> List[str]:
        return [item.strip() for item in self.CORS_ORIGINS.split(',') if item.strip()]


settings = Settings()
