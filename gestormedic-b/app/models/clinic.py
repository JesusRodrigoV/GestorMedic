from typing import Optional, List
from sqlalchemy import String, Boolean, Enum as SQLEnum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy_utils import EncryptedType
from sqlalchemy_utils.types.encrypted.encrypted_type import AesEngine

from app.db.base import Base
from app.core.enums import PlanType
from app.core.config import settings

class Clinic(Base):
    __tablename__ = "clinics"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    
    #PII Encriptado
    nit_ruc: Mapped[str] = mapped_column(
        EncryptedType(String(100), settings.SECRET_KEY, AesEngine, 'pkcs5'),
        unique=True, nullable=False
    )
    phone: Mapped[Optional[str]] = mapped_column(
        EncryptedType(String(50), settings.SECRET_KEY, AesEngine, 'pkcs5')
    )
    
    address: Mapped[Optional[str]] = mapped_column(String(500))
    logo_url: Mapped[Optional[str]] = mapped_column(String(2048))
    is_active: Mapped[bool] = mapped_column(default=True)
    plan: Mapped[PlanType] = mapped_column(SQLEnum(PlanType), default=PlanType.FREE)
    
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    doctor_associations: Mapped[List["ClinicDoctor"]] = relationship("ClinicDoctor", back_populates="clinic")
    specialty_associations: Mapped[List["ClinicSpecialty"]] = relationship("ClinicSpecialty", back_populates="clinic")
    
    rooms: Mapped[List["Room"]] = relationship("Room", back_populates="clinic", cascade="all, delete-orphan")