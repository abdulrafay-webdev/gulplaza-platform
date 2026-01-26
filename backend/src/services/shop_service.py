from sqlmodel import Session, select
from ..models.shop import Shop
from typing import List, Optional

def create_shop(session: Session, shop: Shop) -> Shop:
    session.add(shop)
    session.commit()
    session.refresh(shop)
    return shop

def get_shop_by_owner(session: Session, owner_id: str) -> Optional[Shop]:
    statement = select(Shop).where(Shop.owner_clerk_id == owner_id)
    return session.exec(statement).first()

def get_shop_by_id(session: Session, shop_id: int) -> Optional[Shop]:
    return session.get(Shop, shop_id)

def get_all_shops(session: Session, offset: int = 0, limit: int = 100) -> List[Shop]:
    # Only return shops that are approved by admin AND currently active
    return session.exec(select(Shop).where(Shop.is_approved == True, Shop.is_active == True).offset(offset).limit(limit)).all()

def update_shop(session: Session, shop: Shop, data: dict) -> Shop:
    for key, value in data.items():
        if hasattr(shop, key):
            setattr(shop, key, value)
    session.add(shop)
    session.commit()
    session.refresh(shop)
    return shop
