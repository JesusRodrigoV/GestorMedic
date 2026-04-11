from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    redis_url: str
    celery_backend: str
    database_url: str
    
    whatsapp_access_token: str
    whatsapp_phone_id: str
    sendgrid_api_key: str
    from_email: str
    
    mail_mode: str
    gmail_app_password: str
    internal_auth_secret: str
    auth_algorithm: str = "HS256"

    model_config = SettingsConfigDict(
        env_file=".env", 
        extra="ignore"
    )

settings = Settings()