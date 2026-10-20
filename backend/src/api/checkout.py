from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from src.db.session import get_session
from src.services import checkout_service
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from src.services import customer_service
from src.models.customer import Customer
from src.models.user import User

router = APIRouter()
security = HTTPBearer(auto_error=False)

# Configure logging
logger = logging.getLogger(__name__)

class CartItem(BaseModel):
    product_id: int
    quantity: int
    variant_name: Optional[str] = None
    variant_id: Optional[int] = None
    price: Optional[float] = None

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
    session: Session = Depends(get_session),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """Checkout cart items. Supports Retail (Guest/Customer) and Wholesale B2B (Retail Seller)."""
    try:
        auth_context: Optional[Dict[str, Any]] = None
        if credentials and credentials.credentials:
            try:
                token = credentials.credentials
                payload = jwt.decode(token, customer_service.SECRET_KEY, algorithms=[customer_service.ALGORITHM])
                sub = payload.get("sub")
                
                # Check Customer first
                if sub is not None and str(sub).isdigit():
                    customer = session.get(Customer, int(sub))
                    if customer:
                        auth_context = {
                            "type": "customer",
                            "id": customer.id,
                            "email": customer.email,
                            "name": customer.full_name
                        }

                # Check Seller / Admin User
                if not auth_context and sub:
                    user = session.get(User, str(sub))
                    if user:
                        auth_context = {
                            "type": "user",
                            "id": user.id,
                            "role": user.role,
                            "seller_type": getattr(user, "seller_type", "RETAIL"),
                            "shop_id": user.shop_id,
                            "email": user.email,
                            "name": user.full_name
                        }
            except Exception as auth_err:
                logger.warning(f"Could not extract caller identity from token: {auth_err}")
                session.rollback()

        # Convert Pydantic models to dicts
        items_dict = [i.dict() for i in req.items]
        
        orders = checkout_service.process_checkout(
            session, 
            auth_context=auth_context, 
            items=items_dict,
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
        logger.error(f"Checkout Internal Error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
