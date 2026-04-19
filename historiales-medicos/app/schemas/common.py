from datetime import datetime

from pydantic import BaseModel, Field


class HistoryBasicFieldsUpdateIn(BaseModel):
    blood_type: str | None = Field(default=None, max_length=5)
    allergies: list[str] = Field(default_factory=list)
    chronic_conditions: list[str] = Field(default_factory=list)
    current_medications: list[str] = Field(default_factory=list)
    emergency_contact_name: str | None = Field(default=None, max_length=100)
    emergency_contact_phone: str | None = Field(default=None, max_length=30)
    notes: str | None = Field(default=None, max_length=4000)


class ConsultationEntryIn(BaseModel):
    appointment_id: int
    specialty_id: int
    specialty_name: str
    patient_user_id: int
    section_title: str = Field(min_length=3, max_length=120)
    notes: str | None = Field(default=None, max_length=12000)
    checklist: list[dict] = Field(default_factory=list)
    structured_fields: dict = Field(default_factory=dict)


class ConsultationEntryPatchIn(BaseModel):
    section_title: str | None = Field(default=None, min_length=3, max_length=120)
    notes: str | None = Field(default=None, max_length=12000)
    checklist: list[dict] | None = None
    structured_fields: dict | None = None


class InternalPatientBootstrapIn(BaseModel):
    patient_user_id: int


class InternalAppointmentBootstrapIn(BaseModel):
    appointment_id: int
    patient_user_id: int
    doctor_profile_id: int
    specialty_id: int
    specialty_name: str


class HistoryOut(BaseModel):
    id: str
    patient_user_id: int
    history_key: str
    specialty_id: int | None = None
    specialty_name: str
    doctor_profile_id: int | None = None
    doctor_name: str | None = None
    basic_fields: dict
    created_at: datetime
    updated_at: datetime


class ConsultationEntryOut(BaseModel):
    id: str
    history_id: str
    appointment_id: int
    patient_user_id: int
    doctor_profile_id: int
    specialty_id: int
    specialty_name: str
    section_title: str
    notes: str | None
    checklist: list[dict]
    structured_fields: dict
    created_at: datetime
    editable_until: datetime


class PatientFileOut(BaseModel):
    id: str
    patient_user_id: int
    original_name: str
    content_type: str
    extension: str
    size_bytes: int
    uploaded_at: datetime
    appwrite_file_id: str
    appwrite_bucket_id: str
