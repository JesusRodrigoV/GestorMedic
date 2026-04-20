from datetime import datetime
from pydantic import BaseModel, Field


class AppointmentReportIn(BaseModel):
    report_text: str = Field(min_length=1)
    diagnosis: str | None = Field(default=None, max_length=500)
    prescription: str | None = Field(default=None)
    follow_up: str | None = Field(default=None, max_length=500)


class AppointmentReportOut(BaseModel):
    id: int
    appointment_id: int
    doctor_id: int
    patient_user_id: int
    report_text: str
    diagnosis: str | None = None
    prescription: str | None = None
    follow_up: str | None = None
    created_at: datetime
    updated_at: datetime | None = None


class AppointmentRatingIn(BaseModel):
    rating: int = Field(ge=1, le=3)
    comment: str | None = Field(default=None, max_length=1000)


class AppointmentRatingOut(BaseModel):
    id: int
    appointment_id: int
    patient_user_id: int
    doctor_id: int
    rating: int
    comment: str | None
    created_at: datetime
