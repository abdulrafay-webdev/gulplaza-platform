from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List
from ..db.session import get_session
from ..models.shop import Shop
from ..services import shop_service
from ..auth.deps import get_current_user, get_shop_owner
import logging

from pydantic import BaseModel
from typing import List, Optional

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
        # Enforce owner
        shop.owner_clerk_id = user["id"]
        
        logger.info(f"Creating shop for user: {user['id']} with data: {shop}")

        # Check existing
        existing = shop_service.get_shop_by_owner(session, user["id"])
        if existing:
            raise HTTPException(status_code=400, detail="You already own a shop")
            
        new_shop = shop_service.create_shop(session, shop)
        logger.info(f"Shop created: {new_shop.id}")
        return new_shop
    except Exception as e:
        logger.error(f"Error creating shop: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.put("/me", response_model=Shop)
def update_my_shop(update_data: ShopUpdate, user = Depends(get_current_user), session: Session = Depends(get_session)):
    """Update current user's shop details."""
    shop = shop_service.get_shop_by_owner(session, user["id"])
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    data = update_data.dict(exclude_unset=True)
    return shop_service.update_shop(session, shop, data)

@router.get("/me", response_model=Shop)
def get_my_shop(user = Depends(get_current_user), session: Session = Depends(get_session)):
    """Get current user's shop."""
    shop = shop_service.get_shop_by_owner(session, user["id"])
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
