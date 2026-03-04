from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Table, Column, ForeignKey
from sqlalchemy.sql import func
from datetime import datetime
from ..core.database import Base
from typing import List, Optional

# Association table for many-to-many relationship with products
promo_code_products = Table(
    "promo_code_products",
    Base.metadata,
    Column("promo_code_id", ForeignKey("promo_codes.id"), primary_key=True),
    Column("product_id", ForeignKey("products.id"), primary_key=True),
)

class PromoCode(Base):
    __tablename__ = "promo_codes"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    discount_percent: Mapped[int] = mapped_column(Integer, default=0)
    
    # Validity
    valid_from: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    valid_until: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Limits
    usage_limit: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relationships
    products: Mapped[List["Product"]] = relationship(
        "Product", secondary=promo_code_products
    )
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
