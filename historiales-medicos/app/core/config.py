from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    DATABASE_URL: str
    MONGODB_URI: str
    MONGODB_DB_NAME: str = 'Gestormedic-Historiales'

    SECRET_KEY: str
    ALGORITHM: str = 'HS256'
    API_V1_STR: str = '/api/v1'
    CORS_ORIGINS: str = 'http://localhost:4200'

    DOCTOR_EDIT_WINDOW_DAYS: int = 3
    INTERNAL_API_KEY: str

    APPWRITE_ENDPOINT: str
    APPWRITE_PROJECT_ID: str
    APPWRITE_API_KEY: str
    APPWRITE_BUCKET_PATIENT_FILES: str = 'patient-files'

    @property
    def cors_origins_list(self) -> List[str]:
        return [item.strip() for item in self.CORS_ORIGINS.split(',') if item.strip()]


settings = Settings()
