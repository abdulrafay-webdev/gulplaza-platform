from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from typing import List, Optional
from src.db.session import get_session
from src.models.shop import Shop
from src.models.product import Product
from src.models.order import Order, OrderItem
from src.models.customer import Customer
from src.models.category import Category
from src.models.review import Review
from src.auth.deps import get_super_admin

router = APIRouter()

@router.get("/analytics")
def get_platform_analytics(user = Depends(get_super_admin), session: Session = Depends(get_session)):
    """Comprehensive Super Admin Platform Analytics & KPIs."""
    # 1. Total Platform Revenue
    orders = session.exec(select(Order)).all()
    total_revenue = sum(o.total_amount for o in orders if o.status != "cancelled")
    
    # 2. Orders Breakdown
    orders_by_status = {
        "pending": 0,
        "confirmed": 0,
        "shipped": 0,
        "completed": 0,
        "cancelled": 0
    }
    for o in orders:
        st = o.status.lower()
        if st in orders_by_status:
            orders_by_status[st] += 1
        else:
            orders_by_status[st] = 1

    # 3. Shops Metrics
    all_shops = session.exec(select(Shop)).all()
    total_shops = len(all_shops)
    approved_shops = sum(1 for s in all_shops if s.is_approved)
    pending_shops = sum(1 for s in all_shops if not s.is_approved)
    active_shops = sum(1 for s in all_shops if s.is_active and s.is_approved)

    # 4. Products & Stock Metrics
    all_products = session.exec(select(Product).where(Product.is_deleted == False)).all()
    total_products = len(all_products)
    low_stock_products = sum(1 for p in all_products if p.stock_quantity <= 3)
    out_of_stock_products = sum(1 for p in all_products if p.stock_quantity == 0)

    # 5. Customer & Reviews
    total_customers = len(session.exec(select(Customer)).all())
    total_reviews = len(session.exec(select(Review)).all())

    # 6. Top Performing Shops (by revenue)
    shop_revenue_map = {}
    for o in orders:
        if o.status != "cancelled":
            shop_revenue_map[o.shop_id] = shop_revenue_map.get(o.shop_id, 0) + o.total_amount

    top_shops = []
    for s in all_shops:
        top_shops.append({
            "id": s.id,
            "name": s.name,
            "logo_url": s.logo_url,
            "is_approved": s.is_approved,
            "is_active": s.is_active,
            "total_sales": shop_revenue_map.get(s.id, 0.0),
            "products_count": sum(1 for p in all_products if p.shop_id == s.id)
        })
    top_shops.sort(key=lambda x: x["total_sales"], reverse=True)

    # 7. Recent Platform Orders (Latest 10)
    recent_orders_list = []
    latest_orders = session.exec(select(Order).order_by(Order.created_at.desc()).limit(10)).all()
    for o in latest_orders:
        shop = session.get(Shop, o.shop_id)
        recent_orders_list.append({
            "id": o.id,
            "shop_id": o.shop_id,
            "shop_name": shop.name if shop else f"Shop #{o.shop_id}",
            "customer_name": o.guest_name or "Guest Customer",
            "customer_phone": o.guest_phone or "N/A",
            "total_amount": o.total_amount,
            "status": o.status,
            "created_at": o.created_at,
            "items_count": len(o.items) if o.items else 0
        })

    return {
        "overview": {
            "total_revenue": total_revenue,
            "total_orders": len(orders),
            "total_shops": total_shops,
            "approved_shops": approved_shops,
            "pending_shops": pending_shops,
            "active_shops": active_shops,
            "total_products": total_products,
            "low_stock_products": low_stock_products,
            "out_of_stock_products": out_of_stock_products,
            "total_customers": total_customers,
            "total_reviews": total_reviews
        },
        "orders_breakdown": orders_by_status,
        "top_shops": top_shops,
        "recent_orders": recent_orders_list
    }

@router.get("/shops", response_model=List[Shop])
def list_all_shops(approved: bool = None, user = Depends(get_super_admin), session: Session = Depends(get_session)):
    """List all shops (Admin). Optional filter by approval status."""
    query = select(Shop)
    if approved is not None:
        query = query.where(Shop.is_approved == approved)
    return session.exec(query).all()

@router.post("/shops/{shop_id}/approve", response_model=Shop)
def approve_shop(shop_id: int, user = Depends(get_super_admin), session: Session = Depends(get_session)):
    """Approve a shop."""
    shop = session.get(Shop, shop_id)
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    shop.is_approved = True
    session.add(shop)
    session.commit()
    session.refresh(shop)
    return shop

@router.patch("/shops/{shop_id}/toggle-active", response_model=Shop)
def toggle_shop_active(shop_id: int, user = Depends(get_super_admin), session: Session = Depends(get_session)):
    """Activate or Deactivate a shop."""
    shop = session.get(Shop, shop_id)
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    shop.is_active = not shop.is_active
    session.add(shop)
    session.commit()
    session.refresh(shop)
    return shop

@router.delete("/shops/{shop_id}")
def delete_shop(shop_id: int, user = Depends(get_super_admin), session: Session = Depends(get_session)):
    """Permanently delete a shop."""
    shop = session.get(Shop, shop_id)
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    session.delete(shop)
    session.commit()
    return {"message": "Shop deleted successfully"}
