from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func,  Enum as SQLEnum
from sqlalchemy.orm import relationship, validates
from app.db.base import Base
from app.core.enums import UserRole

from sqlalchemy.ext.hybrid import hybrid_property
from app.models.role import Role
from sqlalchemy.sql import select
from app.core.enums import UserRole, UserStatus

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(200), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, nullable=False)

    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    status = Column(SQLEnum(UserStatus), default=UserStatus.PENDING)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    hashed_password = Column(String(200), nullable=True) 
    google_id = Column(String(255), unique=True, nullable=True, index=True)
    
    is_active = Column(Boolean, default=True, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    photo_url = Column(String(2048), nullable=True) 

    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    role = relationship("Role", back_populates="users")

    is_totp_enabled = Column(Boolean, default=False, nullable=False)
    totp_secret = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False)
    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False)
    
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=True)
    clinic = relationship("Clinic", back_populates="staff")

    backup_codes = relationship("TwoFactorCodes", back_populates="user", cascade="all, delete-orphan")

    #propeidades hibridas
    @hybrid_property
    def is_admin(self):

        return self.role.name == UserRole.ADMINISTRADOR.value

    @is_admin.expression
    def is_admin(cls):
        # subconsulta que revisa el nombre del rol
        return (
            select([Role.name])
            .where(Role.id == cls.role_id)
            .as_scalar()
        ) == UserRole.ADMINISTRADOR.value
    
    #validacion
    @validates('email')
    def validate_and_normalize_email(self, key, email_address):
        if not email_address:
            raise ValueError("El email no puede estar vacio")
              
        normalized_email = email_address.lower().strip()

        if '@' not in normalized_email or '.' not in normalized_email.split('@')[-1]:
             raise ValueError(f"Email no valido: '{email_address}'")
        return normalized_email

