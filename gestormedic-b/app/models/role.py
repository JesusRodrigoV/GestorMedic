from sqlalchemy import Column, Integer, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.core.enums import UserRole

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(SQLEnum(UserRole), unique=True, nullable=False)

    users = relationship("User", back_populates="role")