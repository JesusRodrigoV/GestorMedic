from typing import Optional, List
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Specialty(Base):
    __tablename__ = "specialties"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)

    doctor_associations: Mapped[List["DoctorSpecialty"]] = relationship("DoctorSpecialty", back_populates="specialty")
    clinic_associations: Mapped[List["ClinicSpecialty"]] = relationship("ClinicSpecialty", back_populates="specialty")
