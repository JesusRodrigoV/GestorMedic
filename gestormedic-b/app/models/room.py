from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False) 
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    clinic = relationship("Clinic", back_populates="rooms")
