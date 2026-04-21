from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class RatingBase(BaseModel):
    doctor_id: int
    patient_id: int
    appointment_id: int
    score: float = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class RatingCreate(RatingBase):
    pass

class Rating(RatingBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class DoctorRanking(BaseModel):
    doctor_id: int
    average_score: float
    total_ratings: int
    # Optional enrichment coming from Citas service
    doctor_name: Optional[str] = None
    specialties: Optional[List[str]] = None
    experience_years: Optional[int] = 0
    photo: Optional[str] = None
