from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from src.db.session import get_session
from src.models.shop import Shop
from src.models.product import Product
from src.models.order import Order
from src.models.review import Review
from src.models.ai_chat import AIDemandInsight
from src.services import shop_service
from src.auth.deps import get_current_user, get_shop_owner
import logging
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class ShopUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None

@router.post("/", response_model=Shop)
def create_shop(shop: Shop, user = Depends(get_current_user), session: Session = Depends(get_session)):
    """Create a shop. Any authenticated user can apply to become a shop owner."""
    try:
        shop.owner_clerk_id = user["id"]
        logger.info(f"Creating shop for user: {user['id']} with data: {shop}")

        existing = shop_service.get_shop_by_owner(session, user["id"])
        if existing:
            raise HTTPException(status_code=400, detail="You already own a shop")
            
        new_shop = shop_service.create_shop(session, shop)
        logger.info(f"Shop created: {new_shop.id}")
        return new_shop
    except Exception as e:
        logger.error(f"Error creating shop: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/me/analytics")
def get_my_shop_analytics(user = Depends(get_current_user), session: Session = Depends(get_session)):
    """Analytics & KPIs for the logged-in seller's shop."""
    shop = None
    if user.get("shop_id"):
        shop = session.get(Shop, user["shop_id"])
    if not shop:
        shop = shop_service.get_shop_by_owner(session, user["id"])
    if not shop:
        if user.get("role") == "SUPER_ADMIN" or user.get("email") == "abdullrrafay@gmail.com":
            shop = session.exec(select(Shop)).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    # Orders for this shop
    orders = session.exec(select(Order).where(Order.shop_id == shop.id)).all()
    total_sales = sum(o.total_amount for o in orders if o.status != "cancelled")

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

    # Products for this shop
    products = session.exec(select(Product).where(Product.shop_id == shop.id, Product.is_deleted == False)).all()
    total_products = len(products)
    low_stock = [p for p in products if p.stock_quantity <= 3]

    # Recent shop orders
    recent_orders = session.exec(
        select(Order).where(Order.shop_id == shop.id).order_by(Order.created_at.desc()).limit(10)
    ).all()

    recent_orders_list = []
    for o in recent_orders:
        recent_orders_list.append({
            "id": o.id,
            "guest_name": o.guest_name or "Guest Customer",
            "guest_phone": o.guest_phone or "N/A",
            "guest_address": o.guest_address or "N/A",
            "total_amount": o.total_amount,
            "status": o.status,
            "created_at": o.created_at,
            "items_count": len(o.items) if o.items else 0
        })

    # High Demand Shopper Queries from AI Assistant
    demands = session.exec(
        select(AIDemandInsight).order_by(AIDemandInsight.request_count.desc(), AIDemandInsight.last_requested_at.desc()).limit(8)
    ).all()

    demands_list = [
        {
            "id": d.id,
            "query_text": d.query_text,
            "category_hint": d.category_hint or "General Market",
            "request_count": d.request_count,
            "had_direct_match": d.had_direct_match,
            "last_requested_at": d.last_requested_at
        } for d in demands
    ]

    return {
        "shop": {
            "id": shop.id,
            "name": shop.name,
            "is_approved": shop.is_approved,
            "is_active": shop.is_active,
            "logo_url": shop.logo_url
        },
        "overview": {
            "total_sales": total_sales,
            "total_orders": len(orders),
            "total_products": total_products,
            "low_stock_count": len(low_stock),
        },
        "orders_breakdown": orders_by_status,
        "low_stock_products": [
            {"id": p.id, "name": p.name, "stock_quantity": p.stock_quantity, "price": p.price, "image_url": p.image_url}
            for p in low_stock
        ],
        "recent_orders": recent_orders_list,
        "trending_ai_demands": demands_list
    }

@router.put("/me", response_model=Shop)
def update_my_shop(update_data: ShopUpdate, user = Depends(get_current_user), session: Session = Depends(get_session)):
    """Update current user's shop details."""
    shop = None
    if user.get("shop_id"):
        shop = session.get(Shop, user["shop_id"])
    if not shop:
        shop = shop_service.get_shop_by_owner(session, user["id"])
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    data = update_data.dict(exclude_unset=True)
    return shop_service.update_shop(session, shop, data)

@router.get("/me", response_model=Shop)
def get_my_shop(user = Depends(get_current_user), session: Session = Depends(get_session)):
    """Get current user's shop."""
    shop = None
    if user.get("shop_id"):
        shop = session.get(Shop, user["shop_id"])
    if not shop:
        shop = shop_service.get_shop_by_owner(session, user["id"])
    if not shop:
        if user.get("role") == "SUPER_ADMIN" or user.get("email") == "abdullrrafay@gmail.com":
            shop = session.exec(select(Shop)).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    return shop

@router.get("/", response_model=List[Shop])
def list_shops(session: Session = Depends(get_session)):
    """Public list of shops."""
    return shop_service.get_all_shops(session)

@router.get("/{shop_id}", response_model=Shop)
def get_shop(shop_id: int, session: Session = Depends(get_session)):
    shop = shop_service.get_shop_by_id(session, shop_id)
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    return shop
