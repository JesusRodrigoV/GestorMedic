from datetime import date, datetime, time
from pydantic import BaseModel, Field


class DoctorCardOut(BaseModel):
    doctor_id: int
    user_id: int
    doctor_name: str
    email: str
    bio: str | None
    experience_years: int
    specialties: list[str]


class SlotOut(BaseModel):
    doctor_id: int
    starts_at: datetime
    ends_at: datetime
    specialty_id: int
    specialty_name: str
    room_id: int
    room_name: str
    consultation_price: int | None = None
    is_available: bool


class SlotsByDayOut(BaseModel):
    day: date
    slots: list[SlotOut]


class WeeklyBlockIn(BaseModel):
    weekday: int = Field(ge=0, le=6)
    start_time: time
    end_time: time
    consultation_minutes: int = Field(ge=5, le=240)
    specialty_id: int
    room_id: int
    consultation_price: int | None = Field(default=None, ge=0)


class WeeklyBlockOut(WeeklyBlockIn):
    id: int


class CalendarSlotPatchIn(BaseModel):
    slot_end: datetime
    specialty_id: int
    room_id: int
    consultation_price: int | None = Field(default=None, ge=0)
    extra_description: str | None = Field(default=None, max_length=500)
    is_blocked: bool = False


class AppointmentOut(BaseModel):
    id: int
    doctor_id: int
    doctor_name: str
    patient_user_id: int
    patient_name: str
    specialty_name: str
    room_name: str
    starts_at: datetime
    ends_at: datetime
    status: str
    extra_notes: str | None
    rating: int | None = None


class ReserveAppointmentIn(BaseModel):
    doctor_id: int
    starts_at: datetime
    extra_notes: str | None = Field(default=None, max_length=500)


class RoomDoctorPermissionIn(BaseModel):
    doctor_id: int
    weekday: int = Field(ge=0, le=6)
    start_time: time
    end_time: time


class RoomSpecialtyPermissionIn(BaseModel):
    specialty_id: int


class RoomPermissionOut(BaseModel):
    room_id: int
    doctor_permissions: list[dict]
    specialty_permissions: list[dict]
