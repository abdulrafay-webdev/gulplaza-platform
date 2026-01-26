from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List
from ..db.session import get_session
from ..models.category import Category, SubCategory
from ..services import category_service, shop_service
from ..auth.deps import get_super_admin, get_shop_owner

router = APIRouter()

# --- PUBLIC ---
@router.get("/", response_model=List[Category])
def list_categories(session: Session = Depends(get_session)):
    """List all main categories (Public)."""
    return category_service.get_all_categories(session)

# --- ADMIN ONLY ---
@router.post("/", response_model=Category)
def create_category(category: Category, user = Depends(get_super_admin), session: Session = Depends(get_session)):
    """Create a main category (Admin only)."""
    return category_service.create_category(session, category)

# --- SHOP OWNER: SUB CATEGORIES ---
@router.post("/{main_category_id}/subcategories", response_model=SubCategory)
def create_shop_subcategory(
    main_category_id: int,
    subcategory: SubCategory,
    user = Depends(get_shop_owner), 
    session: Session = Depends(get_session)
):
    """Create a sub-category for your shop under a main category."""
    # Verify shop
    shop = shop_service.get_shop_by_owner(session, user["id"])
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
        
    subcategory.shop_id = shop.id
    subcategory.main_category_id = main_category_id
    
    return category_service.create_subcategory(session, subcategory)

@router.get("/subcategories", response_model=List[SubCategory])
def list_my_subcategories(
    main_category_id: int = None,
    user = Depends(get_shop_owner),
    session: Session = Depends(get_session)
):
    """List sub-categories for the current shop."""
    shop = shop_service.get_shop_by_owner(session, user["id"])
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
        
    return category_service.get_subcategories_by_shop(session, shop.id, main_category_id)
