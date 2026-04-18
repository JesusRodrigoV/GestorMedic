from datetime import datetime, time

from sqlalchemy import Boolean, DateTime, Enum as SQLEnum, ForeignKey, Index, Integer, String, Time, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.enums import AppointmentStatus


class WeeklyAgendaBlock(Base):
    __tablename__ = 'appointment_weekly_blocks'

    id: Mapped[int] = mapped_column(primary_key=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey('doctor_profiles.id'), nullable=False, index=True)
    weekday: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    consultation_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    specialty_id: Mapped[int] = mapped_column(ForeignKey('specialties.id'), nullable=False)
    room_id: Mapped[int] = mapped_column(ForeignKey('rooms.id'), nullable=False)
    consultation_price: Mapped[int | None] = mapped_column(Integer)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    __table_args__ = (
        Index('ix_weekly_block_doctor_weekday', 'doctor_id', 'weekday'),
    )


class SlotOverride(Base):
    __tablename__ = 'appointment_slot_overrides'

    id: Mapped[int] = mapped_column(primary_key=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey('doctor_profiles.id'), nullable=False, index=True)
    slot_start: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False, index=True)
    slot_end: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False)
    specialty_id: Mapped[int] = mapped_column(ForeignKey('specialties.id'), nullable=False)
    room_id: Mapped[int] = mapped_column(ForeignKey('rooms.id'), nullable=False)
    consultation_price: Mapped[int | None] = mapped_column(Integer)
    extra_description: Mapped[str | None] = mapped_column(String(500))
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    __table_args__ = (
        UniqueConstraint('doctor_id', 'slot_start', name='uq_slot_override_doctor_slot_start'),
    )


class Appointment(Base):
    __tablename__ = 'appointments'

    id: Mapped[int] = mapped_column(primary_key=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey('doctor_profiles.id'), nullable=False, index=True)
    patient_user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False, index=True)
    specialty_id: Mapped[int] = mapped_column(ForeignKey('specialties.id'), nullable=False)
    room_id: Mapped[int] = mapped_column(ForeignKey('rooms.id'), nullable=False)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False, index=True)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False)
    status: Mapped[AppointmentStatus] = mapped_column(
        SQLEnum(AppointmentStatus), default=AppointmentStatus.CONFIRMED, nullable=False
    )
    extra_notes: Mapped[str | None] = mapped_column(String(500))

    __table_args__ = (
        Index('ix_appointment_doctor_starts_at', 'doctor_id', 'starts_at'),
        Index('ix_appointment_patient_starts_at', 'patient_user_id', 'starts_at'),
    )


class RoomDoctorPermission(Base):
    __tablename__ = 'room_doctor_permissions'

    id: Mapped[int] = mapped_column(primary_key=True)
    room_id: Mapped[int] = mapped_column(ForeignKey('rooms.id'), nullable=False, index=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey('doctor_profiles.id'), nullable=False, index=True)
    weekday: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            'room_id',
            'doctor_id',
            'weekday',
            'start_time',
            'end_time',
            name='uq_room_doctor_permission_unique_slot',
        ),
    )


class RoomSpecialtyPermission(Base):
    __tablename__ = 'room_specialty_permissions'

    id: Mapped[int] = mapped_column(primary_key=True)
    room_id: Mapped[int] = mapped_column(ForeignKey('rooms.id'), nullable=False, index=True)
    specialty_id: Mapped[int] = mapped_column(ForeignKey('specialties.id'), nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    __table_args__ = (
        UniqueConstraint('room_id', 'specialty_id', name='uq_room_specialty_permission'),
    )
