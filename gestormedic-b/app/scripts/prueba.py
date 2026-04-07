from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship, validates
from app.db.base import Base
from app.core.enums import UserRole

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(200), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    
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
    backup_codes = relationship("TwoFactorCodes", back_populates="user", cascade="all, delete-orphan")

    #redis
    locked_until = Column(DateTime(timezone=True), nullable=True)
    
    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False)
    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False)
    
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=True)
    clinic = relationship("Clinic", back_populates="staff")

    @validates('email')
    def validate_and_normalize_email(self, key, email_address):
        if not email_address:
            raise ValueError("El email no puede estar vacio")
              
        normalized_email = email_address.lower().strip()

        if '@' not in normalized_email or '.' not in normalized_email.split('@')[-1]:
             raise ValueError(f"Email no valido: '{email_address}'")
        return normalized_email

    @validates('username')
    def validate_and_normalize_username(self, key, username):
        if not username:
            raise ValueError("El nombre de usuario no puede estar vacio")

        normalized_username = username.strip()
        #solo alfanumerico
        #if not re.match("^[a-zA-Z0-9_.-]+$", normalized_username):
        #     raise ValueError("El nombre de usuario solo puede contener letras, numeros, _, . y -")

        return normalized_username