# TODO: Modificar y arreglar estos modelos
from datetime import time, datetime
from typing import Optional
from sqlalchemy import (
    Integer,
    String,
    Boolean,
    Time,
    DateTime,
    ForeignKey,
    Index,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AppointmentWeeklyBlock(Base):
    __tablename__ = "appointment_weekly_blocks"

    id: Mapped[int] = mapped_column(primary_key=True)
    doctor_id: Mapped[int] = mapped_column(
        ForeignKey("doctor_profiles.id"), nullable=False
    )
    weekday: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    consultation_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    specialty_id: Mapped[int] = mapped_column(
        ForeignKey("specialties.id"), nullable=False
    )
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"), nullable=False)
    consultation_price: Mapped[Optional[int]] = mapped_column(Integer)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    doctor: Mapped["DoctorProfile"] = relationship("DoctorProfile")
    specialty: Mapped["Specialty"] = relationship("Specialty")
    room: Mapped["Room"] = relationship("Room")

    __table_args__ = (Index("ix_weekly_block_doctor_weekday", "doctor_id", "weekday"),)


class AppointmentSlotOverride(Base):
    __tablename__ = "appointment_slot_overrides"

    id: Mapped[int] = mapped_column(primary_key=True)
    doctor_id: Mapped[int] = mapped_column(
        ForeignKey("doctor_profiles.id"), nullable=False
    )
    slot_start: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    slot_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    specialty_id: Mapped[int] = mapped_column(
        ForeignKey("specialties.id"), nullable=False
    )
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"), nullable=False)
    consultation_price: Mapped[Optional[int]] = mapped_column(Integer)
    extra_description: Mapped[Optional[str]] = mapped_column(String(500))
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    doctor: Mapped["DoctorProfile"] = relationship("DoctorProfile")
    specialty: Mapped["Specialty"] = relationship("Specialty")
    room: Mapped["Room"] = relationship("Room")

    __table_args__ = (
        UniqueConstraint(
            "doctor_id", "slot_start", name="uq_slot_override_doctor_slot_start"
        ),
    )


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(primary_key=True)
    doctor_id: Mapped[int] = mapped_column(
        ForeignKey("doctor_profiles.id"), nullable=False
    )
    patient_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    specialty_id: Mapped[int] = mapped_column(
        ForeignKey("specialties.id"), nullable=False
    )
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"), nullable=False)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    extra_notes: Mapped[Optional[str]] = mapped_column(String(500))

    doctor: Mapped["DoctorProfile"] = relationship("DoctorProfile")
    patient: Mapped["User"] = relationship("User")
    specialty: Mapped["Specialty"] = relationship("Specialty")
    room: Mapped["Room"] = relationship("Room")

    __table_args__ = (
        Index("ix_appointment_doctor_starts_at", "doctor_id", "starts_at"),
        Index("ix_appointment_patient_starts_at", "patient_user_id", "starts_at"),
    )


class RoomDoctorPermission(Base):
    __tablename__ = "room_doctor_permissions"

    id: Mapped[int] = mapped_column(primary_key=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"), nullable=False)
    doctor_id: Mapped[int] = mapped_column(
        ForeignKey("doctor_profiles.id"), nullable=False
    )
    weekday: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    room: Mapped["Room"] = relationship("Room")
    doctor: Mapped["DoctorProfile"] = relationship("DoctorProfile")

    __table_args__ = (
        UniqueConstraint(
            "room_id",
            "doctor_id",
            "weekday",
            "start_time",
            "end_time",
            name="uq_room_doctor_permission_unique_slot",
        ),
    )


class RoomSpecialtyPermission(Base):
    __tablename__ = "room_specialty_permissions"

    id: Mapped[int] = mapped_column(primary_key=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"), nullable=False)
    specialty_id: Mapped[int] = mapped_column(
        ForeignKey("specialties.id"), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    room: Mapped["Room"] = relationship("Room")
    specialty: Mapped["Specialty"] = relationship("Specialty")

    __table_args__ = (
        UniqueConstraint(
            "room_id", "specialty_id", name="uq_room_specialty_permission"
        ),
    )
