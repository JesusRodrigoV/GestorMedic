from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.db.base import Base

class Specialty(Base):
    __tablename__ = "specialties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)

    doctors = relationship("DoctorProfile", secondary="doctor_specialties", back_populates="specialties")
    clinics = relationship("Clinic", secondary="clinic_specialties", back_populates="specialties")