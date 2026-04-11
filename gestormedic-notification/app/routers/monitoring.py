from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import text
import redis
from app.database import SessionLocal
from app.config import settings

router = APIRouter(prefix="/system", tags=["Monitoring"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Verificar estado del servicio",
    description="Realiza un diagnostico de conexion con PostgreSQL y Redis para asegurar la operatividad del microservicio.",
)
def health_check(db: Session = Depends(get_db)):
    health_status = {
        "status": "operational",
        "services": {"database": "down", "redis": "down"},
    }

    try:
        db.execute(text("SELECT 1"))
        health_status["services"]["database"] = "up"
    except Exception:
        health_status["status"] = "partially_degraded"

    try:
        r = redis.from_url(settings.redis_url)
        if r.ping():
            health_status["services"]["redis"] = "up"
    except Exception:
        health_status["status"] = "partially_degraded"

    return health_status
