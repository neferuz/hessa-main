from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Float, ForeignKey, Text, JSON
from ..core.database import Base
from typing import List, Optional, Dict

class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    image: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    description_short: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Relationship
    products: Mapped[List["Product"]] = relationship("Product", back_populates="category", cascade="all, delete-orphan")

class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    
    # Basic Info
    name: Mapped[str] = mapped_column(String(200), index=True)
    sku: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    
    # Content
    description_short: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    description_full: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    images: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True) # List of image URLs
    
    # Details
    size_volume: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    usage: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    delivery_info: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Economics (Pricing Calculation)
    cost_price: Mapped[float] = mapped_column(Float, default=0.0) # Base cost (sum)
    customs_percent: Mapped[float] = mapped_column(Float, default=0.0) # Customs fee %
    tax_percent: Mapped[float] = mapped_column(Float, default=0.0) # Tax %
    sale_price: Mapped[float] = mapped_column(Float, default=0.0) # Final selling price
    
    # Detailed Composition
    composition: Mapped[Optional[Dict]] = mapped_column(JSON, nullable=True) # Structured ingredient data
    plans: Mapped[Optional[List[Dict]]] = mapped_column(JSON, nullable=True) # Multiple pricing/duration options
    is_active: Mapped[bool] = mapped_column(default=True)
    
    # Relationship
    category: Mapped["Category"] = relationship("Category", back_populates="products")
