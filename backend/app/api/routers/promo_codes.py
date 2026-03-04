from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ...core.database import get_db
from ...services.promo_code_service import PromoCodeService
from ...schemas.promo_code import PromoCodeCreate, PromoCodeUpdate, PromoCodeResponse
from typing import List

router = APIRouter(prefix="/promo-codes", tags=["promo-codes"])

@router.get("/", response_model=List[PromoCodeResponse])
async def get_all_promo_codes(db: AsyncSession = Depends(get_db)):
    service = PromoCodeService(db)
    return await service.get_all()

@router.get("/{promo_id}", response_model=PromoCodeResponse)
async def get_promo_code(promo_id: int, db: AsyncSession = Depends(get_db)):
    service = PromoCodeService(db)
    promo = await service.get_by_id(promo_id)
    if not promo:
        raise HTTPException(status_code=404, detail="Promo code not found")
    return promo

@router.post("/", response_model=PromoCodeResponse)
async def create_promo_code(promo_in: PromoCodeCreate, db: AsyncSession = Depends(get_db)):
    service = PromoCodeService(db)
    # Check if code exists
    existing = await service.get_by_code(promo_in.code)
    if existing:
        raise HTTPException(status_code=400, detail="Promo code already exists")
    return await service.create(promo_in)

@router.put("/{promo_id}", response_model=PromoCodeResponse)
async def update_promo_code(promo_id: int, promo_in: PromoCodeUpdate, db: AsyncSession = Depends(get_db)):
    service = PromoCodeService(db)
    promo = await service.update(promo_id, promo_in)
    if not promo:
        raise HTTPException(status_code=404, detail="Promo code not found")
    return promo

@router.delete("/{promo_id}")
async def delete_promo_code(promo_id: int, db: AsyncSession = Depends(get_db)):
    service = PromoCodeService(db)
    success = await service.delete(promo_id)
    if not success:
        raise HTTPException(status_code=404, detail="Promo code not found")
    return {"status": "success"}

@router.get("/validate/{code}", response_model=PromoCodeResponse)
async def validate_promo_code(code: str, db: AsyncSession = Depends(get_db)):
    service = PromoCodeService(db)
    promo = await service.get_by_code(code)
    if not promo or not promo.is_active:
        raise HTTPException(status_code=404, detail="Invalid promo code")
    
    # Check expiry
    from datetime import datetime
    if promo.valid_until and promo.valid_until < datetime.now():
         raise HTTPException(status_code=400, detail="Promo code expired")
    
    # Check usage limit
    if promo.usage_limit and promo.usage_count >= promo.usage_limit:
        raise HTTPException(status_code=400, detail="Usage limit reached")
        
    return promo
