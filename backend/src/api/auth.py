from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from sqlmodel import Session, select
from datetime import datetime, timedelta
import uuid
import logging

from src.db.session import get_session
from src.models.user import User
from src.models.shop import Shop
from src.services.customer_service import (
    get_password_hash,
    verify_password,
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_DAYS
)
from src.auth.deps import get_current_user
from jose import jwt

logger = logging.getLogger(__name__)
router = APIRouter()

class SellerRegisterRequest(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    password: str
    shop_name: str
    shop_description: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None

class SellerLoginRequest(BaseModel):
    login_id: str  # Email or Phone
    password: str

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict
    shop: Optional[dict] = None
    message: Optional[str] = None

def create_user_access_token(user_id: str, role: str, email: str, shop_id: Optional[int] = None) -> str:
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "role": role,
        "email": email,
        "shop_id": shop_id,
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/seller/register", response_model=AuthTokenResponse)
def register_seller(data: SellerRegisterRequest, session: Session = Depends(get_session)):
    """Register a new seller and shop. Shop starts in is_approved=False (Pending Approval)."""
    email_clean = data.email.strip().lower()
    
    # 1. Check if user email already exists
    existing_user = session.exec(select(User).where(User.email == email_clean)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered. Please sign in.")

    # 2. Check if shop name already exists
    existing_shop = session.exec(select(Shop).where(Shop.name == data.shop_name.strip())).first()
    if existing_shop:
        raise HTTPException(status_code=400, detail="A shop with this name already exists. Please choose a unique name.")

    try:
        user_id = f"seller_{uuid.uuid4().hex[:12]}"
        
        # 3. Create Shop with is_approved=False
        new_shop = Shop(
            name=data.shop_name.strip(),
            description=data.shop_description,
            logo_url=data.logo_url,
            cover_image_url=data.cover_image_url,
            owner_clerk_id=user_id,
            is_active=True,
            is_approved=False  # Requires Super Admin approval
        )
        session.add(new_shop)
        session.commit()
        session.refresh(new_shop)

        # 4. Create User linked to shop
        new_user = User(
            id=user_id,
            email=email_clean,
            phone=data.phone,
            full_name=data.full_name,
            hashed_password=get_password_hash(data.password),
            role="SELLER",
            shop_id=new_shop.id,
            is_active=True
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        token = create_user_access_token(
            user_id=new_user.id,
            role="SELLER",
            email=new_user.email,
            shop_id=new_shop.id
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "full_name": new_user.full_name,
                "phone": new_user.phone,
                "role": new_user.role,
                "shop_id": new_shop.id
            },
            "shop": {
                "id": new_shop.id,
                "name": new_shop.name,
                "description": new_shop.description,
                "logo_url": new_shop.logo_url,
                "cover_image_url": new_shop.cover_image_url,
                "is_approved": new_shop.is_approved,
                "is_active": new_shop.is_active
            },
            "message": "Shop registration submitted! Your store is currently pending Super Admin review."
        }
    except Exception as e:
        logger.error(f"Seller registration error: {e}")
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to register shop: {str(e)}")

@router.post("/seller/login", response_model=AuthTokenResponse)
def login_seller(data: SellerLoginRequest, session: Session = Depends(get_session)):
    """Authenticate a seller by email/phone and password."""
    login_id = data.login_id.strip().lower()
    
    # Find user by email or phone
    user = session.exec(
        select(User).where((User.email == login_id) | (User.phone == login_id))
    ).first()

    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid email/phone or password")

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email/phone or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Your seller account has been deactivated. Please contact support.")

    # Find attached shop
    shop = None
    if user.shop_id:
        shop = session.get(Shop, user.shop_id)
    if not shop:
        shop = session.exec(select(Shop).where(Shop.owner_clerk_id == user.id)).first()

    token = create_user_access_token(
        user_id=user.id,
        role=user.role,
        email=user.email,
        shop_id=shop.id if shop else None
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "role": user.role,
            "shop_id": shop.id if shop else None
        },
        "shop": {
            "id": shop.id,
            "name": shop.name,
            "description": shop.description,
            "logo_url": shop.logo_url,
            "cover_image_url": shop.cover_image_url,
            "is_approved": shop.is_approved,
            "is_active": shop.is_active
        } if shop else None
    }

@router.post("/admin/login", response_model=AuthTokenResponse)
def login_admin(data: AdminLoginRequest, session: Session = Depends(get_session)):
    """Super Admin login portal."""
    email_clean = data.email.strip().lower()
    
    # 1. Check hardcoded/bootstrap super admin
    if email_clean == "abdullrrafay@gmail.com" and data.password == "Rafay@2005":
        admin_user = session.exec(select(User).where(User.email == email_clean)).first()
        if not admin_user:
            admin_user = User(
                id="super_admin_rafay",
                email=email_clean,
                full_name="Abdul Rafay",
                hashed_password=get_password_hash("Rafay@2005"),
                role="SUPER_ADMIN",
                is_active=True
            )
            session.add(admin_user)
            session.commit()
            session.refresh(admin_user)

        token = create_user_access_token(
            user_id=admin_user.id,
            role="SUPER_ADMIN",
            email=admin_user.email,
            shop_id=None
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": admin_user.id,
                "email": admin_user.email,
                "full_name": admin_user.full_name,
                "role": "SUPER_ADMIN"
            },
            "message": "Super Admin access granted."
        }

    # 2. Check DB for other admin users
    user = session.exec(select(User).where(User.email == email_clean, User.role == "SUPER_ADMIN")).first()
    if not user or not user.hashed_password or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid Super Admin credentials")

    token = create_user_access_token(
        user_id=user.id,
        role="SUPER_ADMIN",
        email=user.email,
        shop_id=None
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        },
        "message": "Super Admin access granted."
    }

@router.get("/me", response_model=dict)
def get_authenticated_profile(user = Depends(get_current_user), session: Session = Depends(get_session)):
    """Retrieve logged in user and associated store."""
    shop = None
    if user.get("shop_id"):
        shop = session.get(Shop, user["shop_id"])
    if not shop and user.get("id"):
        shop = session.exec(select(Shop).where(Shop.owner_clerk_id == user["id"])).first()

    return {
        "user": user,
        "shop": {
            "id": shop.id,
            "name": shop.name,
            "description": shop.description,
            "logo_url": shop.logo_url,
            "cover_image_url": shop.cover_image_url,
            "is_approved": shop.is_approved,
            "is_active": shop.is_active
        } if shop else None
    }
