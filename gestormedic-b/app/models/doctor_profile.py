from typing import Optional, List
from sqlalchemy import String, Text, ForeignKey, Integer, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), unique=True, nullable=False
    )

    license_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    bio: Mapped[Optional[str]] = mapped_column(Text)
    experience_years: Mapped[int] = mapped_column(Integer, default=0)
    signature_url: Mapped[Optional[str]] = mapped_column(String(2048))
    base_consultation_price: Mapped[float] = mapped_column(Float, default=0.0)
    is_telemedicine_enabled: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship("User", back_populates="doctor_profile")

    clinic_associations: Mapped[List["ClinicDoctor"]] = relationship(
        "ClinicDoctor", back_populates="doctor", cascade="all, delete-orphan"
    )
    specialty_associations: Mapped[List["DoctorSpecialty"]] = relationship(
        "DoctorSpecialty", back_populates="doctor", cascade="all, delete-orphan"
    )
    specialties: Mapped[List["Specialty"]] = relationship(
        "Specialty", secondary="doctor_specialties", back_populates="doctors"
    )
