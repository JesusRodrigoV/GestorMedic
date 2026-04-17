from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Role(Base):
    __tablename__ = 'roles'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(200), nullable=False)
    username: Mapped[str] = mapped_column(String(100), nullable=False)
    clinic_id: Mapped[int | None] = mapped_column(ForeignKey('clinics.id'))
    role_id: Mapped[int] = mapped_column(ForeignKey('roles.id'), nullable=False)


class ClinicDoctor(Base):
    __tablename__ = 'clinic_doctors'

    clinic_id: Mapped[int] = mapped_column(ForeignKey('clinics.id'), primary_key=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey('doctor_profiles.id'), primary_key=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class DoctorProfile(Base):
    __tablename__ = 'doctor_profiles'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), unique=True, nullable=False)
    license_number: Mapped[str] = mapped_column(String(50), nullable=False)
    bio: Mapped[str | None] = mapped_column(Text)
    experience_years: Mapped[int] = mapped_column(Integer, default=0)


class Specialty(Base):
    __tablename__ = 'specialties'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)


class DoctorSpecialty(Base):
    __tablename__ = 'doctor_specialties'

    doctor_id: Mapped[int] = mapped_column(ForeignKey('doctor_profiles.id'), primary_key=True)
    specialty_id: Mapped[int] = mapped_column(ForeignKey('specialties.id'), primary_key=True)


class Room(Base):
    __tablename__ = 'rooms'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    clinic_id: Mapped[int] = mapped_column(ForeignKey('clinics.id'), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
