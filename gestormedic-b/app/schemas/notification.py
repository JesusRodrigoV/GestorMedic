from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List

class NotificationBase(BaseModel):
    title: str
    message: str

class NotificationOut(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class NotificationUpdate(BaseModel):
    is_read: bool

class NotificationList(BaseModel):
    items: List[NotificationOut]
    unread_count: int
