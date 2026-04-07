from sqlalchemy.orm import declarative_base

Base = declarative_base()

from app.models import (
    User, Role, RefreshToken, PasswordResetToken, TwoFactorCodes, 
    AuditLog, Clinic, InsuranceProfile, PatientProfile, 
    Specialty, StaffProfile, DoctorProfile
)
from app.models.associations import doctor_specialties, clinic_doctors, clinic_specialties