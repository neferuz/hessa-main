from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PromoCodeBase(BaseModel):
    code: str
    discount_percent: int
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: bool = True
    usage_limit: Optional[int] = None
    usage_count: int = 0
    product_ids: List[int] = []

class PromoCodeCreate(PromoCodeBase):
    pass

class PromoCodeUpdate(PromoCodeBase):
    code: Optional[str] = None
    discount_percent: Optional[int] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: Optional[bool] = None
    usage_limit: Optional[int] = None
    usage_count: Optional[int] = None
    product_ids: Optional[List[int]] = None

class PromoCodeResponse(PromoCodeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
