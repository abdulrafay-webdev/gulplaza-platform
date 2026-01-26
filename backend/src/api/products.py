from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import selectinload
import shutil
import uuid
import os
from ..db.session import get_session
from ..models.product import Product, ProductImage, ProductCreate, ProductRead
from ..services import product_service, shop_service, image_service
from ..auth.deps import get_shop_owner

router = APIRouter()

@router.get("/imagekit-auth")
def get_imagekit_auth():
    """Get authentication parameters for ImageKit client-side upload."""
    return image_service.get_auth_params()

@router.get("/products/{product_id}", response_model=ProductRead)
def get_product(product_id: int, session: Session = Depends(get_session)):
    """Get a single product details (Public)."""
    # Use eager load via service or selectinload
    product = session.exec(
        select(Product).where(Product.id == product_id).options(selectinload(Product.images))
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/shops/{shop_id}/products", response_model=ProductRead)
def create_product(
    shop_id: int, 
    product_in: ProductCreate, 
    user = Depends(get_shop_owner), 
    session: Session = Depends(get_session)
):
    """Add a product to a shop. Must be the owner."""
    # Verify ownership
    shop = shop_service.get_shop_by_id(session, shop_id)
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
        
    if shop.owner_clerk_id != user["id"]:
        raise HTTPException(status_code=403, detail="You do not own this shop")
        
    product_data = product_in.dict(exclude={"image_urls"})
    product_data["shop_id"] = shop_id
    
    return product_service.create_product(session, product_data, product_in.image_urls)

@router.get("/shops/{shop_id}/products", response_model=List[ProductRead])
def list_products(shop_id: int, session: Session = Depends(get_session)):
    """List products for a shop (Public)."""
    # Use selectinload for images
    statement = select(Product).where(Product.shop_id == shop_id).options(selectinload(Product.images))
    return session.exec(statement).all()

@router.delete("/products/{product_id}")
def delete_product(product_id: int, user = Depends(get_shop_owner), session: Session = Depends(get_session)):
    """Delete a product. Must be owner."""
    product = product_service.get_product_by_id(session, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    shop = shop_service.get_shop_by_id(session, product.shop_id)
    if shop.owner_clerk_id != user["id"]:
        raise HTTPException(status_code=403, detail="Not your product")
        
    product_service.delete_product(session, product)
    return {"message": "Product deleted"}

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    stock_quantity: Optional[int] = None
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    image_url: Optional[str] = None
    image_urls: Optional[List[str]] = None # New
    main_category_id: Optional[int] = None
    sub_category_id: Optional[int] = None

@router.put("/products/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int, 
    update_data: ProductUpdate, 
    user = Depends(get_shop_owner), 
    session: Session = Depends(get_session)
):
    """Update a product."""
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    shop = shop_service.get_shop_by_id(session, product.shop_id)
    if shop.owner_clerk_id != user["id"]:
        raise HTTPException(status_code=403, detail="Not your product")
        
    data = update_data.dict(exclude_unset=True, exclude={"image_urls"})
    image_urls = update_data.image_urls
    
    return product_service.update_product(session, product, data, image_urls)
