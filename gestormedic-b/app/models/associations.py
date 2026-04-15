from sqlalchemy import ForeignKey, Integer, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class ClinicDoctor(Base):
    __tablename__ = "clinic_doctors"

    clinic_id: Mapped[int] = mapped_column(ForeignKey("clinics.id"), primary_key=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctor_profiles.id"), primary_key=True)
    
    is_active: Mapped[bool] = mapped_column(default=True)
    
    clinic: Mapped["Clinic"] = relationship(back_populates="doctor_associations")
    doctor: Mapped["DoctorProfile"] = relationship(back_populates="clinic_associations")

class DoctorSpecialty(Base):
    __tablename__ = "doctor_specialties"

    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctor_profiles.id"), primary_key=True)
    specialty_id: Mapped[int] = mapped_column(ForeignKey("specialties.id"), primary_key=True)

    doctor: Mapped["DoctorProfile"] = relationship(back_populates="specialty_associations")
    specialty: Mapped["Specialty"] = relationship(back_populates="doctor_associations")

class ClinicSpecialty(Base):
    __tablename__ = "clinic_specialties"

    clinic_id: Mapped[int] = mapped_column(ForeignKey("clinics.id"), primary_key=True)
    specialty_id: Mapped[int] = mapped_column(ForeignKey("specialties.id"), primary_key=True)

    clinic: Mapped["Clinic"] = relationship(back_populates="specialty_associations")
    specialty: Mapped["Specialty"] = relationship(back_populates="clinic_associations")