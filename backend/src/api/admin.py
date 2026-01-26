from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from src.db.session import get_session
from src.models.shop import Shop
from src.auth.deps import get_super_admin

router = APIRouter()

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
