from datetime import datetime
from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    event: Mapped[str] = mapped_column(String(100), index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    attempted_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    clinic_id: Mapped[int | None] = mapped_column(ForeignKey("clinics.id"), nullable=True)
    details: Mapped[dict] = mapped_column(JSON, default=dict)
