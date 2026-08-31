from sqlmodel import Session, select
from src.models.shop import Shop
from src.models.user import User
from typing import List, Optional

def create_shop(session: Session, shop: Shop) -> Shop:
    session.add(shop)
    session.commit()
    session.refresh(shop)
    return shop

def get_shop_by_owner(session: Session, owner_id: str) -> Optional[Shop]:
    # 1. Look up by direct owner_clerk_id
    statement = select(Shop).where(Shop.owner_clerk_id == str(owner_id))
    shop = session.exec(statement).first()
    if shop:
        return shop

    # 2. Look up via User table linked shop_id
    user = session.get(User, str(owner_id))
    if user and user.shop_id:
        return session.get(Shop, user.shop_id)

    # 3. Look up User by email or phone
    user = session.exec(select(User).where((User.email == str(owner_id)) | (User.phone == str(owner_id)))).first()
    if user and user.shop_id:
        return session.get(Shop, user.shop_id)

    return None

def get_shop_by_id(session: Session, shop_id: int) -> Optional[Shop]:
    return session.get(Shop, shop_id)

def get_all_shops(session: Session, offset: int = 0, limit: int = 100) -> List[Shop]:
    # Only return shops that are approved by admin AND currently active
    return session.exec(select(Shop).where(Shop.is_approved == True, Shop.is_active == True).offset(offset).limit(limit)).all()

def search_shops(session: Session, query: str, limit: int = 5) -> List[Shop]:
    statement = select(Shop).where(
        Shop.is_approved == True, 
        Shop.is_active == True,
        (Shop.name.ilike(f"%{query}%")) | (Shop.description.ilike(f"%{query}%"))
    ).limit(limit)
    return session.exec(statement).all()

def update_shop(session: Session, shop: Shop, data: dict) -> Shop:
    for key, value in data.items():
        if hasattr(shop, key):
            setattr(shop, key, value)
    session.add(shop)
    session.commit()
    session.refresh(shop)
    return shop
