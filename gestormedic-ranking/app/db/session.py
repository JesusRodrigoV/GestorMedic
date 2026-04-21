import re
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings


def _convert_url(url: str) -> str:
    if url and url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg2://")
    return url


sync_url = _convert_url(settings.DATABASE_URL)
engine = create_engine(sync_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
