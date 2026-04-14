from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    license_number = Column(String(50), unique=True, nullable=False)
    bio = Column(Text, nullable=True)
    experience_years = Column(Integer, default=0)
    signature_url = Column(String(2048), nullable=True) 

    user = relationship("User", back_populates="doctor_profile")
    clinics = relationship("Clinic", secondary="clinic_doctors", back_populates="doctors")

    specialties = relationship("Specialty", secondary="doctor_specialties", back_populates="doctors")