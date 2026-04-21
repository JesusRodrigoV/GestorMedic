from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AppointmentReport(Base):
    __tablename__ = 'appointment_reports'

    id: Mapped[int] = mapped_column(primary_key=True)
    appointment_id: Mapped[int] = mapped_column(ForeignKey('appointments.id', ondelete='CASCADE'), nullable=False, index=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey('doctor_profiles.id'), nullable=False, index=True)
    patient_user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False, index=True)
    report_text: Mapped[str] = mapped_column(Text, nullable=False)
    diagnosis: Mapped[str | None] = mapped_column(String(500), nullable=True)
    prescription: Mapped[str | None] = mapped_column(Text, nullable=True)
    follow_up: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)

    __table_args__ = (
        UniqueConstraint('appointment_id', name='uq_appointment_report_appointment_id'),
        Index('ix_appointment_report_doctor', 'doctor_id'),
    )


class AppointmentRating(Base):
    __tablename__ = 'appointment_ratings'

    id: Mapped[int] = mapped_column(primary_key=True)
    appointment_id: Mapped[int] = mapped_column(ForeignKey('appointments.id', ondelete='CASCADE'), nullable=False, index=True)
    patient_user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False, index=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey('doctor_profiles.id'), nullable=False, index=True)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('appointment_id', 'patient_user_id', name='uq_appointment_rating_unique'),
        Index('ix_appointment_rating_doctor', 'doctor_id'),
    )
