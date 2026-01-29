from sqlmodel import Session, select
from typing import Optional, List
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
import os
from ..models.customer import Customer

# Password hashing configuration
# Switching to PBKDF2 to avoid bcrypt library/72-byte issues
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# JWT configuration
SECRET_KEY = os.getenv("CUSTOMER_JWT_SECRET", "default_secret_for_customers_123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_customer(session: Session, customer_data: dict) -> Customer:
    # Hash password
    customer_data["hashed_password"] = get_password_hash(customer_data.pop("password"))
    customer = Customer(**customer_data)
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return customer

def get_customer_by_identity(session: Session, login_id: str) -> Optional[Customer]:
    """Find customer by email OR phone."""
    statement = select(Customer).where((Customer.email == login_id) | (Customer.phone == login_id))
    return session.exec(statement).first()

def get_customer_orders(session: Session, customer_id: int):
    # This logic will be used in the API
    from ..models.order import Order
    from sqlalchemy.orm import selectinload
    from ..models.order import OrderItem
    
    statement = select(Order).where(Order.customer_id == customer_id).options(
        selectinload(Order.items).selectinload(OrderItem.product)
    ).order_by(Order.created_at.desc())
    return session.exec(statement).all()
