from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Float, ForeignKey, Text, DateTime, JSON
from sqlalchemy.sql import func
from typing import Optional, List
from datetime import datetime
from ..core.database import Base

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    
    # Order info
    order_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, processing, completed, cancelled
    payment_status: Mapped[str] = mapped_column(String(50), default="pending")  # paid, pending, failed
    payment_method: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # card, cash, bank_transfer, online
    
    # Delivery info
    region: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Products (stored as JSON)
    products: Mapped[Optional[List[dict]]] = mapped_column(JSON, nullable=True)
    referral_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    
    # Pricing
    total_amount: Mapped[float] = mapped_column(Float, default=0.0)
    duration: Mapped[int] = mapped_column(Integer, default=1)  # months
    ai_analysis: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    quiz_answers: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relationship
    user: Mapped["User"] = relationship("User", back_populates="orders")
