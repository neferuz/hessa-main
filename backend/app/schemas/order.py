from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class OrderItem(BaseModel):
    id: str
    productName: str
    quantity: int
    price: float

class OrderBase(BaseModel):
    user_id: int
    order_number: str
    status: str = "pending"
    payment_status: str = "pending"
    payment_method: Optional[str] = None
    region: Optional[str] = None
    address: Optional[str] = None
    products: Optional[List[Dict]] = None
    total_amount: float = 0.0
    duration: int = 1
    ai_analysis: Optional[str] = None
    quiz_answers: Optional[Dict] = None
    referral_code: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    payment_method: Optional[str] = None
    completed_at: Optional[datetime] = None

from .user import UserShort

class OrderResponse(OrderBase):
    id: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    user: Optional[UserShort] = None

    class Config:
        from_attributes = True
