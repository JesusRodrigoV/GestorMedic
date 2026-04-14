from sqlalchemy import Column, String, Integer, JSON, Text
from app.database import Base


class NotificationRecord(Base):
    __tablename__ = "notification_records"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    event_type = Column(String)
    status = Column(String)
    payload = Column(JSON)


class CustomTemplate(Base):
    __tablename__ = "custom_templates"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(String, index=True)
    event_type = Column(String, index=True)
    content = Column(Text)
