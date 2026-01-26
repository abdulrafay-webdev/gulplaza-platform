from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session
from typing import List
from ..db.session import get_session
from ..models.order import Order, OrderRead
from ..services import order_service, shop_service
from ..auth.deps import get_current_user
from pydantic import BaseModel

router = APIRouter()

class OrderStatusUpdate(BaseModel):
    status: str

@router.get("/orders", response_model=List[OrderRead])
def list_orders(user = Depends(get_current_user), session: Session = Depends(get_session)):
    """
    List orders contextually.
    - Shop Owners see orders for their shop.
    - Customers see their own orders.
    """
    if user["role"] == "SHOP_OWNER":
        # Get Shop ID
        shop = shop_service.get_shop_by_owner(session, user["id"])
        if not shop:
             # If they don't have a shop yet, they have no orders
             return []
        return order_service.get_orders(session, shop_id=shop.id)
    else:
        # Assume Customer
        return order_service.get_orders(session, customer_id=user["id"])

@router.get("/orders/{order_id}", response_model=OrderRead)
def get_order(order_id: int, user = Depends(get_current_user), session: Session = Depends(get_session)):
    order = order_service.get_order_by_id(session, order_id)
    if not order:
        raise HTTPException(404, "Order not found")
        
    # Access Control
    if user["role"] == "SHOP_OWNER":
        shop = shop_service.get_shop_by_owner(session, user["id"])
        if not shop or order.shop_id != shop.id:
             raise HTTPException(403, "Not your order")
    else:
        # Allow if it's the customer OR if user is Admin (for future)
        # For guest orders (no clerk_id), maybe allow if session matches? (Out of scope)
        # Assuming authenticated viewing for now.
        if order.customer_clerk_id and order.customer_clerk_id != user["id"]:
             raise HTTPException(403, "Not your order")
             
    return order

@router.patch("/orders/{order_id}/status", response_model=OrderRead)
def update_status(
    order_id: int, 
    update: OrderStatusUpdate, 
    user = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    """Update status (Shop Owner only)."""
    if user["role"] != "SHOP_OWNER":
        raise HTTPException(403, "Only Shop Owners can update status")
        
    order = order_service.get_order_by_id(session, order_id)
    if not order:
        raise HTTPException(404, "Order not found")
        
    shop = shop_service.get_shop_by_owner(session, user["id"])
    if not shop or order.shop_id != shop.id:
        raise HTTPException(403, "Not your order")
        
    return order_service.update_order_status(session, order, update.status)
