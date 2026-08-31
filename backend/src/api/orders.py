from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from typing import List, Optional
from src.db.session import get_session
from src.models.order import Order, OrderRead
from src.models.shop import Shop
from src.services import order_service, shop_service, customer_service
from src.auth.deps import get_current_user
from pydantic import BaseModel
from jose import jwt

router = APIRouter()
security = HTTPBearer(auto_error=False)

class OrderStatusUpdate(BaseModel):
    status: str

@router.get("/orders", response_model=List[OrderRead])
def list_orders(user = Depends(get_current_user), session: Session = Depends(get_session)):
    """
    List orders contextually based on user role:
    - SUPER_ADMIN: Returns all orders on the marketplace.
    - SELLER / SHOP_OWNER: Returns orders for their store.
    - CUSTOMER: Returns orders placed by this customer.
    """
    role = str(user.get("role", "")).upper()
    user_id = str(user.get("id"))
    shop_id = user.get("shop_id")

    # 1. Super Admin sees all platform orders
    if role == "SUPER_ADMIN" or user.get("email") == "abdullrrafay@gmail.com":
        return order_service.get_all_orders(session)

    # 2. Seller / Shop Owner sees their store orders
    if role in ["SELLER", "SHOP_OWNER"] or shop_id:
        shop = None
        if shop_id:
            shop = session.get(Shop, shop_id)
        if not shop:
            shop = shop_service.get_shop_by_owner(session, user_id)
        if not shop:
            return []
        return order_service.get_orders(session, shop_id=shop.id)

    # 3. Customer sees their placed orders
    return order_service.get_orders(session, customer_id=user_id)

@router.get("/orders/{order_id}", response_model=OrderRead)
def get_order(
    order_id: int, 
    session: Session = Depends(get_session),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """
    Get single order detail with security check:
    - Super Admin
    - Seller owning the shop
    - Customer who placed the order
    """
    order = order_service.get_order_by_id(session, order_id)
    if not order:
        raise HTTPException(404, "Order not found")
        
    token = credentials.credentials if credentials else None
    if not token:
        raise HTTPException(401, "Authentication required")

    try:
        payload = jwt.decode(token, customer_service.SECRET_KEY, algorithms=[customer_service.ALGORITHM])
        user_id = str(payload.get("sub"))
        role = str(payload.get("role", "")).upper()
        shop_id = payload.get("shop_id")
        email = payload.get("email")

        # 1. Super Admin
        if role == "SUPER_ADMIN" or email == "abdullrrafay@gmail.com":
            return order

        # 2. Seller owning the shop
        if role in ["SELLER", "SHOP_OWNER"] or shop_id:
            if shop_id and order.shop_id == shop_id:
                return order
            shop = shop_service.get_shop_by_owner(session, user_id)
            if shop and order.shop_id == shop.id:
                return order

        # 3. Customer owning the order
        if order.customer_id and str(order.customer_id) == user_id:
            return order
        if order.customer_clerk_id and str(order.customer_clerk_id) == user_id:
            return order
    except Exception:
        pass

    raise HTTPException(403, "Access Denied")

@router.patch("/orders/{order_id}/status", response_model=OrderRead)
def update_status(
    order_id: int, 
    update: OrderStatusUpdate, 
    user = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    """Update order status (Shop Owner or Super Admin)."""
    order = order_service.get_order_by_id(session, order_id)
    if not order:
        raise HTTPException(404, "Order not found")

    role = str(user.get("role", "")).upper()

    # 1. Super Admin has global override
    if role == "SUPER_ADMIN" or user.get("email") == "abdullrrafay@gmail.com":
        return order_service.update_order_status(session, order, update.status)

    # 2. Seller must own the store
    if role in ["SELLER", "SHOP_OWNER"] or user.get("shop_id"):
        shop = None
        if user.get("shop_id"):
            shop = session.get(Shop, user["shop_id"])
        if not shop:
            shop = shop_service.get_shop_by_owner(session, user["id"])

        if shop and order.shop_id == shop.id:
            return order_service.update_order_status(session, order, update.status)

    raise HTTPException(403, "Not authorized to update this order")
