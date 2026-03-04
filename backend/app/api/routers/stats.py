from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User
from app.models.employee import Employee
from app.models.product import Product
from app.models.order import Order
from app.models.analysis import AnalysisRequest
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    days: int = Query(30, description="Stats for the last X days")
):
    threshold = datetime.now() - timedelta(days=days)
    prev_threshold = threshold - timedelta(days=days)

    users_result = await db.execute(select(func.count(User.id)))
    users_count = users_result.scalar() or 0
    
    new_users_result = await db.execute(select(func.count(User.id)).where(User.created_at >= threshold))
    new_users_count = new_users_result.scalar() or 0
    
    orders_result = await db.execute(select(func.count(Order.id)))
    orders_count = orders_result.scalar() or 0
    
    revenue_result = await db.execute(select(func.sum(Order.total_amount)).where(Order.payment_status == 'paid'))
    total_revenue = revenue_result.scalar() or 0
    
    pending_orders_result = await db.execute(select(func.count(Order.id)).where(Order.status == 'pending'))
    pending_orders = pending_orders_result.scalar() or 0

    analysis_count_result = await db.execute(select(func.count(AnalysisRequest.id)))
    analysis_count = analysis_count_result.scalar() or 0
    
    pending_analysis_result = await db.execute(
        select(func.count(AnalysisRequest.id)).where(AnalysisRequest.status.in_(['pending', 'scheduled']))
    )
    pending_analysis = pending_analysis_result.scalar() or 0

    # Recent orders for the dashboard
    recent_orders_result = await db.execute(
        select(Order, User)
        .join(User, Order.user_id == User.id)
        .order_by(Order.created_at.desc())
        .limit(10)
    )
    recent_orders = []
    for order, user in recent_orders_result.all():
        recent_orders.append({
            "id": order.id,
            "user_name": user.username,
            "amount": order.total_amount,
            "status": order.status,
            "created_at": order.created_at.strftime("%d.%m.%Y %H:%M")
        })

    # Recent analysis requests
    recent_analysis_result = await db.execute(
        select(AnalysisRequest, User)
        .join(User, AnalysisRequest.user_id == User.id)
        .order_by(AnalysisRequest.created_at.desc())
        .limit(10)
    )
    recent_analysis = []
    for req, user in recent_analysis_result.all():
        recent_analysis.append({
            "id": req.id,
            "user_name": user.username,
            "status": req.status,
            "created_at": req.created_at.strftime("%d.%m.%Y %H:%M")
        })

    # Recent users
    recent_users_result = await db.execute(
        select(User).order_by(User.created_at.desc()).limit(10)
    )
    recent_users = []
    for user in recent_users_result.scalars().all():
        recent_users.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "telegram_id": user.telegram_id,
            "created_at": user.created_at.strftime("%d.%m.%Y %H:%M")
        })

    chart_data = []
    for i in range(7):
        d = datetime.now() - timedelta(days=6-i)
        start_of_day = d.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = d.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        daily_orders_res = await db.execute(
            select(func.count(Order.id)).where(and_(Order.created_at >= start_of_day, Order.created_at <= end_of_day))
        )
        daily_users_res = await db.execute(
            select(func.count(User.id)).where(and_(User.created_at >= start_of_day, User.created_at <= end_of_day))
        )
        daily_analysis_res = await db.execute(
            select(func.count(AnalysisRequest.id)).where(and_(AnalysisRequest.created_at >= start_of_day, AnalysisRequest.created_at <= end_of_day))
        )
        
        chart_data.append({
            "month": d.strftime("%d.%m"),
            "newLeads": daily_users_res.scalar() or 0,
            "replied": daily_orders_res.scalar() or 0,
            "analysis": daily_analysis_res.scalar() or 0
        })

    return {
        "users_count": users_count,
        "employees_count": await db.scalar(select(func.count(Employee.id))) or 0,
        "products_count": await db.scalar(select(func.count(Product.id))) or 0,
        "revenue": total_revenue,
        "pending_orders": pending_orders,
        "orders_count": orders_count,
        "analysis_count": analysis_count,
        "pending_analysis": pending_analysis,
        "active_now": 12, 
        "trends": {
            "users": f"+{new_users_count}",
            "revenue": "+15%",
            "orders": f"+{orders_count}",
            "analysis": f"+{pending_analysis}"
        },
        "chart_data": chart_data,
        "recent_orders": recent_orders,
        "recent_analysis": recent_analysis,
        "recent_users": recent_users
    }
