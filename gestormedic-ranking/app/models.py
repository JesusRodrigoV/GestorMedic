from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.db.session import Base


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    appointment_id = Column(Integer, unique=True, index=True, nullable=False)
    score = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
