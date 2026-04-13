from typing import Optional
from sqlalchemy import String, Boolean, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(default=True)
    
    clinic_id: Mapped[int] = mapped_column(ForeignKey("clinics.id"), nullable=False)
    clinic: Mapped["Clinic"] = relationship("Clinic", back_populates="rooms")