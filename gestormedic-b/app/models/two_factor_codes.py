from sqlalchemy import String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class TwoFactorCodes(Base):
    __tablename__ = "two_factor_codes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    code_hash: Mapped[str] = mapped_column(String(255), nullable=False) 
    is_used: Mapped[bool] = mapped_column(default=False, nullable=False)
    
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    user: Mapped["User"] = relationship("User", back_populates="backup_codes")
    
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )

    def __repr__(self) -> str:
        return f"<TwoFactorCode(user_id={self.user_id}, is_used={self.is_used})>"