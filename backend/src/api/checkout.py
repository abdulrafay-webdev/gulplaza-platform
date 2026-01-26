from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from ..db.session import get_session
from ..services import checkout_service
from ..auth.deps import get_current_user
from pydantic import BaseModel
from typing import List

router = APIRouter()

class CartItem(BaseModel):
    product_id: int
    quantity: int

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from ..db.session import get_session
from ..services import checkout_service
from ..auth.deps import get_current_user
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class CartItem(BaseModel):
    product_id: int
    quantity: int

class CheckoutRequest(BaseModel):
    items: List[CartItem]
    # Guest Details (Optional if logged in, but we might force them for guest)
    guest_name: Optional[str] = None
    guest_email: Optional[str] = None
    guest_phone: Optional[str] = None
    guest_address: Optional[str] = None

import logging

# Configure logging
logger = logging.getLogger(__name__)

@router.post("/checkout")
def checkout(
    req: CheckoutRequest, 
    # User is optional now
    session: Session = Depends(get_session)
):
    """Checkout cart items. Splits into orders per shop. Supports Guest Checkout."""
    try:
        # TODO: Ideally check if user token is present manually if we want to support both
        # For now, we assume Guest flow is primary as per instructions "Buyer login ... deferred"
        
        user_id = None # req.user_id if we had it
        
        # Convert Pydantic models to dicts
        # Use .dict() for compatibility
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
