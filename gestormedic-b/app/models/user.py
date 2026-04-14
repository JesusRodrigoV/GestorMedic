from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, Enum as SQLEnum, ForeignKey, select
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy_utils import EncryptedType
from sqlalchemy_utils.types.encrypted.encrypted_type import AesEngine
from sqlalchemy.dialects.postgresql import ARRAY

from app.db.base import Base
from app.core.enums import UserRole, UserStatus
from app.core.config import settings
from app.models.role import Role

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    # PII Encriptado
    #AesEngine con la llave definida en settings
    first_name: Mapped[Optional[str]] = mapped_column(
        EncryptedType(String(100), settings.SECRET_KEY, AesEngine, 'pkcs5')
    )
    last_name: Mapped[Optional[str]] = mapped_column(
        EncryptedType(String(100), settings.SECRET_KEY, AesEngine, 'pkcs5')
    )
    
    photo_url: Mapped[Optional[str]] = mapped_column(String(2048))

    hashed_password: Mapped[Optional[str]] = mapped_column(String(200))
    google_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True)
    
    is_totp_enabled: Mapped[bool] = mapped_column(default=False, nullable=False)
    totp_secret: Mapped[Optional[str]] = mapped_column(
        EncryptedType(String(255), settings.TOTP_ENCRYPTION_KEY, AesEngine, 'pkcs5')
    )
    backup_codes: Mapped[list[str]] = mapped_column(ARRAY(String), server_default="{}", default=list)

    status: Mapped[UserStatus] = mapped_column(SQLEnum(UserStatus), default=UserStatus.PENDING)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    locked_until: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    login_attempts: Mapped[int] = mapped_column(Integer, default=0)
    email_verified: Mapped[bool] = mapped_column(default=False, nullable=False)
    
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    deleted_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(timezone=True))

    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False)
    role: Mapped["Role"] = relationship("Role", back_populates="users")

    doctor_profile: Mapped[Optional["DoctorProfile"]] = relationship("DoctorProfile", back_populates="user", uselist=False)
    patient_profile: Mapped[Optional["PatientProfile"]] = relationship("PatientProfile", back_populates="user", uselist=False)
    backup_codes: Mapped[List["TwoFactorCodes"]] = relationship("TwoFactorCodes", back_populates="user", cascade="all, delete-orphan")

    #
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        "RefreshToken", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )
    
#HYBRYD PROPERTIES
    @hybrid_property
    def full_name(self) -> str:
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.first_name or self.username

    @hybrid_property
    def is_fully_active(self) -> bool:
        return self.is_active and self.email_verified and self.status == UserStatus.COMPLETED

    @hybrid_property
    def is_admin(self) -> bool:
        return self.role.name == UserRole.SUPERADMIN

    @is_admin.expression
    def is_admin(cls):
        return (
            select(Role.name)
            .where(Role.id == cls.role_id)
            .correlate_except(Role)
            .scalar_subquery()
        ) == UserRole.SUPERADMIN

    @validates('email')
    def validate_and_normalize_email(self, key, email_address):
        if not email_address:
            raise ValueError("El email no puede estar vacio")
        return email_address.lower().strip()