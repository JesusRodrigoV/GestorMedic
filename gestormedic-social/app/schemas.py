from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ConnectionBase(BaseModel):
    doctor_id: int

class ConnectionCreate(ConnectionBase):
    patient_id: int

class ConnectionUpdate(BaseModel):
    status: str # ACCEPTED, REJECTED

class ConnectionOut(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatMessageBase(BaseModel):
    content: str

class ChatMessageCreate(ChatMessageBase):
    connection_id: int
    sender_id: int

class ChatMessageOut(ChatMessageBase):
    id: int
    connection_id: int
    sender_id: int
    created_at: datetime
    is_read: int

    class Config:
        from_attributes = True
