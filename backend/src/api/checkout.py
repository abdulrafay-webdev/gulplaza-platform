from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from src.db.session import get_session
from src.services import checkout_service
from src.auth.deps import get_current_user
from pydantic import BaseModel
from typing import List, Optional
import logging

router = APIRouter()

# Configure logging
logger = logging.getLogger(__name__)

class CartItem(BaseModel):
    product_id: int
    quantity: int

class CheckoutRequest(BaseModel):
    items: List[CartItem]
    # Guest Details
    guest_name: Optional[str] = None
    guest_email: Optional[str] = None
    guest_phone: Optional[str] = None
    guest_address: Optional[str] = None

@router.post("/checkout")
def checkout(
    req: CheckoutRequest, 
    session: Session = Depends(get_session)
):
    """Checkout cart items. Splits into orders per shop. Supports Guest Checkout."""
    try:
        user_id = None
        
        # Convert Pydantic models to dicts
        items_dict = [i.dict() for i in req.items]
        
        orders = checkout_service.process_checkout(
            session, 
            user_id, 
            items_dict,
            guest_info={
                "name": req.guest_name,
                "email": req.guest_email,
                "phone": req.guest_phone,
                "address": req.guest_address
            }
        )
        return {"message": "Order placed successfully", "order_ids": [o.id for o in orders]}
    except ValueError as e:
        logger.error(f"Checkout Validation Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Checkout Internal Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")