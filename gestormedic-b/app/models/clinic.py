from sqlalchemy import Column, Integer, String, Boolean, Enum as SQLEnum, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.core.enums import PlanType

class Clinic(Base):
    __tablename__ = "clinics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    nit_ruc = Column(String(50), unique=True, nullable=False) 
    address = Column(String(500), nullable=True)
    phone = Column(String(50), nullable=True)
    logo_url = Column(String(2048), nullable=True)
    
    is_active = Column(Boolean, default=True)
    plan = Column(SQLEnum(PlanType), default=PlanType.FREE)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    staff = relationship("User", back_populates="clinic")
    doctors = relationship("DoctorProfile", secondary="clinic_doctors", back_populates="clinics")
    specialties = relationship("Specialty", secondary="clinic_specialties", back_populates="clinics")
    rooms = relationship("Room", back_populates="clinic")