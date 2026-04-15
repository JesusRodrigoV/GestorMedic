from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime
from app.core.enums import UserRole, UserStatus

class UserAdminUpdate(BaseModel):
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    clinic_id: Optional[int] = None 

class UserLockRequest(BaseModel):
    lock_minutes: int = 60
    reason: str

class UserAdminOut(BaseModel):
    id: int
    email: EmailStr
    username: str
    role: UserRole
    status: UserStatus
    is_active: bool
    is_totp_enabled: bool
    last_login: Optional[datetime] = None
    locked_until: Optional[datetime] = None
    clinic_id: Optional[int] = None
    
    class Config:
        model_config = ConfigDict(from_attributes=True)

class DashboardStats(BaseModel):
    total_users: int
    active_doctors: int
    new_patients_today: int