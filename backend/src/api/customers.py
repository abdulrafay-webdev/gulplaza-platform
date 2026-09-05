from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from typing import List, Optional
from pydantic import BaseModel
from src.db.session import get_session
from src.models.customer import Customer, CustomerBase
from src.services import customer_service
from jose import jwt
import os

router = APIRouter()
security = HTTPBearer()

class CustomerSignup(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str

class CustomerLogin(BaseModel):
    login_id: str  # Email or Phone
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

# Dependency to get current customer from JWT
def get_current_customer(credentials: HTTPAuthorizationCredentials = Depends(security), session: Session = Depends(get_session)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, customer_service.SECRET_KEY, algorithms=[customer_service.ALGORITHM])
        sub = payload.get("sub")
        if not sub or not str(sub).isdigit():
            raise HTTPException(status_code=401, detail="Invalid token for customer")
        customer_id = int(sub)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=401, detail="Customer not found")
    return customer

import logging
logger = logging.getLogger(__name__)

@router.post("/signup", response_model=dict)
def signup(data: CustomerSignup, session: Session = Depends(get_session)):
    try:
        if not data.email and not data.phone:
            raise HTTPException(status_code=400, detail="Email or Phone is required")
        
        # Check uniqueness
        if data.email and customer_service.get_customer_by_identity(session, data.email):
            raise HTTPException(status_code=400, detail="Email already registered")
        if data.phone and customer_service.get_customer_by_identity(session, data.phone):
            raise HTTPException(status_code=400, detail="Phone already registered")
        
        customer = customer_service.create_customer(session, data.dict())
        return {"message": "Signup successful", "customer_id": customer.id}
    except Exception as e:
        logger.error(f"Signup error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=Token)
def login(data: CustomerLogin, session: Session = Depends(get_session)):
    customer = customer_service.get_customer_by_identity(session, data.login_id)
    if not customer or not customer_service.verify_password(data.password, customer.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email/phone or password")
    
    access_token = customer_service.create_access_token(data={"sub": str(customer.id)})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": customer.id,
            "full_name": customer.full_name,
            "email": customer.email,
            "phone": customer.phone
        }
    }

@router.get("/me", response_model=dict)
def get_me(customer: Customer = Depends(get_current_customer)):
    return {
        "id": customer.id,
        "full_name": customer.full_name,
        "email": customer.email,
        "phone": customer.phone,
        "created_at": customer.created_at
    }

@router.get("/orders", response_model=List[dict])
def list_orders(customer: Customer = Depends(get_current_customer), session: Session = Depends(get_session)):
    orders = customer_service.get_customer_orders(session, customer.id)
    # Return as dicts or use OrderReadWithItems
    return [o.dict() for o in orders]
