from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class InsuranceProfile(Base):
    __tablename__ = "insurance_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    company_name = Column(String(200), nullable=False)
    tax_id = Column(String(50), unique=True, nullable=False)
    contact_phone = Column(String(50), nullable=True)
    contact_email = Column(String(200), nullable=True)
    office_address = Column(String(500), nullable=True)

    contact_person = Column(String(100), nullable=True)

    user = relationship("User")