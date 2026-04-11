from sqlalchemy import Column, Integer, ForeignKey, Table
from app.db.base import Base

clinic_doctors = Table(
    "clinic_doctors",
    Base.metadata,
    Column("clinic_id", Integer, ForeignKey("clinics.id"), primary_key=True),
    Column("doctor_id", Integer, ForeignKey("doctor_profiles.id"), primary_key=True)
)
doctor_specialties = Table(
    "doctor_specialties",
    Base.metadata,
    Column("doctor_id", Integer, ForeignKey("doctor_profiles.id"), primary_key=True),
    Column("specialty_id", Integer, ForeignKey("specialties.id"), primary_key=True)
)
clinic_specialties = Table(
    "clinic_specialties",
    Base.metadata,
    Column("clinic_id", Integer, ForeignKey("clinics.id"), primary_key=True),
    Column("specialty_id", Integer, ForeignKey("specialties.id"), primary_key=True)
)