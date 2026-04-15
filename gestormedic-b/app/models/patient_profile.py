from datetime import date
from typing import Optional
from sqlalchemy import String, Date, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy_utils import EncryptedType
from sqlalchemy_utils.types.encrypted.encrypted_type import AesEngine

from app.db.base import Base
from app.core.config import settings

class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    gender: Mapped[Optional[str]] = mapped_column(String(20))
    blood_type: Mapped[Optional[str]] = mapped_column(String(5))
    
    allergies: Mapped[Optional[str]] = mapped_column(Text)
    
    # PII Encriptado
    ci_number: Mapped[str] = mapped_column(
        EncryptedType(String(100), settings.SECRET_KEY, AesEngine, 'pkcs5'),
        unique=True, index=True, nullable=False
    )
    occupation: Mapped[Optional[str]] = mapped_column(String(100))
    
    emergency_contact_name: Mapped[Optional[str]] = mapped_column(
        EncryptedType(String(150), settings.SECRET_KEY, AesEngine, 'pkcs5')
    )
    emergency_contact_phone: Mapped[Optional[str]] = mapped_column(
        EncryptedType(String(50), settings.SECRET_KEY, AesEngine, 'pkcs5')
    )

    user: Mapped["User"] = relationship("User", back_populates="patient_profile")