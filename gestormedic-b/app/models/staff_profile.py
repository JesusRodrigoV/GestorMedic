from typing import Optional
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class StaffProfile(Base):
    __tablename__ = "staff_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    
    employee_id: Mapped[Optional[str]] = mapped_column(String(50), unique=True)
    position: Mapped[Optional[str]] = mapped_column(String(100))
    
    user: Mapped["User"] = relationship("User", back_populates="staff_profile")