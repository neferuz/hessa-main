from sqlalchemy.ext.asyncio import AsyncSession
from ..repositories.order_repository import OrderRepository
from ..repositories.user_repository import UserRepository
from ..schemas.order import OrderCreate, OrderUpdate
from ..models.order import Order
import uuid
from datetime import datetime

class OrderService:
    def __init__(self, db: AsyncSession):
        self.repository = OrderRepository(db)
        self.user_repository = UserRepository(db)

    async def create_order(self, order_data: OrderCreate):
        db_order = Order(
            user_id=order_data.user_id,
            order_number=order_data.order_number or f"ORD-{uuid.uuid4().hex[:8].upper()}",
            status=order_data.status,
            payment_status=order_data.payment_status,
            payment_method=order_data.payment_method,
            region=order_data.region,
            address=order_data.address,
            products=order_data.products,
            total_amount=order_data.total_amount,
            duration=order_data.duration,
            ai_analysis=order_data.ai_analysis,
            quiz_answers=order_data.quiz_answers,
            referral_code=order_data.referral_code
        )
        return await self.repository.create(db_order)

    async def get_order(self, order_id: int):
        return await self.repository.get_by_id(order_id)

    async def get_user_orders(self, user_id: int):
        return await self.repository.get_by_user_id(user_id)

    async def update_order(self, order_id: int, order_data: OrderUpdate):
        # Get current order state to check for status change
        current_order = await self.repository.get_by_id(order_id)
        if not current_order:
            return None

        old_status = current_order.status
        update_dict = order_data.model_dump(exclude_unset=True)
        updated_order = await self.repository.update(order_id, update_dict)

        # Logic for referral tokens: if order completed now and has referral code
        if old_status != "completed" and updated_order.status == "completed" and updated_order.referral_code:
            referrer = await self.user_repository.get_by_referral_code(updated_order.referral_code)
            if referrer:
                # 10% of total_amount as tokens
                reward_tokens = int(updated_order.total_amount * 0.1)
                if reward_tokens > 0:
                    await self.user_repository.update(referrer.id, {"tokens": referrer.tokens + reward_tokens})
                    print(f"Referral bonus: {reward_tokens} tokens given to user {referrer.username} for order {updated_order.order_number}")

        return updated_order

    async def get_all_orders(self):
        return await self.repository.get_all()
