from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from ..models.promo_code import PromoCode
from ..models.product import Product
from ..schemas.promo_code import PromoCodeCreate, PromoCodeUpdate

class PromoCodeService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[PromoCode]:
        stmt = select(PromoCode).options(selectinload(PromoCode.products))
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, promo_id: int) -> Optional[PromoCode]:
        stmt = select(PromoCode).where(PromoCode.id == promo_id).options(selectinload(PromoCode.products))
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_code(self, code: str) -> Optional[PromoCode]:
        stmt = select(PromoCode).where(PromoCode.code == code).options(selectinload(PromoCode.products))
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def create(self, promo_in: PromoCodeCreate) -> PromoCode:
        # Check for products
        products = []
        if promo_in.product_ids:
            stmt = select(Product).where(Product.id.in_(promo_in.product_ids))
            result = await self.db.execute(stmt)
            products = result.scalars().all()

        promo = PromoCode(
            code=promo_in.code,
            discount_percent=promo_in.discount_percent,
            valid_from=promo_in.valid_from,
            valid_until=promo_in.valid_until,
            is_active=promo_in.is_active,
            usage_limit=promo_in.usage_limit,
            usage_count=0,
            products=products
        )
        self.db.add(promo)
        await self.db.commit()
        await self.db.refresh(promo)
        return promo

    async def update(self, promo_id: int, promo_in: PromoCodeUpdate) -> Optional[PromoCode]:
        promo = await self.get_by_id(promo_id)
        if not promo:
            return None

        update_data = promo_in.model_dump(exclude_unset=True)
        
        # Handle products separately if provided
        if "product_ids" in update_data:
            product_ids = update_data.pop("product_ids")
            if product_ids is not None:
                stmt = select(Product).where(Product.id.in_(product_ids))
                result = await self.db.execute(stmt)
                promo.products = result.scalars().all()

        for field, value in update_data.items():
            setattr(promo, field, value)

        await self.db.commit()
        await self.db.refresh(promo)
        return promo

    async def delete(self, promo_id: int) -> bool:
        promo = await self.get_by_id(promo_id)
        if not promo:
            return False
        await self.db.delete(promo)
        await self.db.commit()
        return True
