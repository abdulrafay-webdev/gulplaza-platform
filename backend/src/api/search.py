from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import List, Dict, Any
from src.db.session import get_session
from src.services import shop_service, product_service
from src.models.shop import Shop
from src.models.product import ProductRead

router = APIRouter()

@router.get("/", response_model=Dict[str, Any])
def unified_search(
    q: str = Query(..., min_length=1, description="Search query"),
    session: Session = Depends(get_session)
):
    """
    Search for shops and products simultaneously.
    Returns aggregated results.
    """
    shops = shop_service.search_shops(session, q, limit=5)
    products = product_service.search_products(session, q, limit=10)
    
    return {
        "shops": shops,
        "products": products
    }
