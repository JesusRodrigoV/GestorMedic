from typing import List, Union
import json
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = 'HS256'
    API_V1_STR: str = '/api/v1'
    
    CORS_ORIGINS: Union[str, List[str]] = 'http://localhost:4200'
    HISTORIES_SERVICE_URL: str | None = None
    HISTORIES_INTERNAL_API_KEY: str | None = None

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            return json.loads(v)
        return v

    @property
    def cors_origins_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        return [item.strip() for item in self.CORS_ORIGINS.split(',') if item.strip()]

settings = Settings()