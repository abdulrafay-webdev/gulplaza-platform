from sqlmodel import Session, select
from typing import List, Optional
from sqlalchemy.orm import selectinload
from src.models.order import Order, OrderItem
from src.models.shop import Shop

def get_orders(session: Session, shop_id: Optional[int] = None, customer_id: Optional[str] = None) -> List[Order]:
    # Load items and their products
    query = select(Order).options(selectinload(Order.items).selectinload(OrderItem.product))
    if shop_id:
        query = query.where(Order.shop_id == shop_id)
    if customer_id:
        if str(customer_id).isdigit():
            c_id = int(customer_id)
            query = query.where((Order.customer_id == c_id) | (Order.customer_clerk_id == str(customer_id)))
        else:
            query = query.where(Order.customer_clerk_id == str(customer_id))
    
    # Sort by date desc
    query = query.order_by(Order.created_at.desc())
    return session.exec(query).all()

def get_all_orders(session: Session) -> List[Order]:
    query = select(Order).options(
        selectinload(Order.items).selectinload(OrderItem.product)
    ).order_by(Order.created_at.desc())
    return session.exec(query).all()

def get_order_by_id(session: Session, order_id: int) -> Optional[Order]:
    return session.exec(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.id == order_id)
    ).first()

def update_order_status(session: Session, order: Order, status: str) -> Order:
    order.status = status
    session.add(order)
    session.commit()
    session.refresh(order)
    return order
