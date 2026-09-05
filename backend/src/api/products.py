from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Response
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel, field_validator
import math
from sqlalchemy.orm import selectinload
import shutil
import uuid
import os
from src.db.session import get_session
from src.models.product import Product, ProductImage, ProductCreate, ProductRead
from src.models.shop import Shop
from src.services import product_service, shop_service, image_service
from src.auth.deps import get_shop_owner

router = APIRouter()

@router.get("/imagekit-auth")
def get_imagekit_auth():
    """Get authentication parameters for ImageKit client-side upload."""
    return image_service.get_auth_params()

@router.get("/products", response_model=List[ProductRead])
def list_all_products(
    response: Response,
    limit: int = 50, 
    offset: int = 0, 
    search: Optional[str] = None, 
    session: Session = Depends(get_session)
):
    """List all products across all shops (Public)."""
    if not search:
        response.headers["Cache-Control"] = "public, max-age=30, stale-while-revalidate=120"

    query = select(Product).where(Product.is_deleted == False).options(
        selectinload(Product.images),
        selectinload(Product.variants)
    )
    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))
    
    query = query.offset(offset).limit(limit).order_by(Product.id.desc())
    prods = session.exec(query).all()
    if not prods:
        return []
    
    shop_ids = list({p.shop_id for p in prods if p.shop_id})
    shop_map = {}
    if shop_ids:
        shops = session.exec(select(Shop).where(Shop.id.in_(shop_ids))).all()
        shop_map = {s.id: s.name for s in shops}

    return [
        product_service.format_product_read(p, shop_map.get(p.shop_id, f"Shop #{p.shop_id}"))
        for p in prods
    ]

@router.get("/products/{product_id}", response_model=ProductRead)
def get_product(product_id: int, response: Response, session: Session = Depends(get_session)):
    """Get a single product details (Public)."""
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=300"
    product = session.exec(
        select(Product).where(Product.id == product_id, Product.is_deleted == False).options(
            selectinload(Product.images),
            selectinload(Product.variants)
        )
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    shop_name = None
    if product.shop_id:
        shop = session.get(Shop, product.shop_id)
        if shop:
            shop_name = shop.name
    return product_service.format_product_read(product, shop_name)

import base64

@router.post("/products/upload-image")
async def upload_product_image(
    file: UploadFile = File(...)
):
    """Upload product image to ImageKit with base64 Data URI fallback."""
    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size exceeds 10MB limit.")

    try:
        file_name = f"product_{uuid.uuid4().hex[:8]}_{file.filename}"
        upload_result = image_service.imagekit.upload_file(
            file=file_bytes,
            file_name=file_name,
            options={
                "folder": "/ai-plaza/product-images",
                "use_unique_file_name": True
            }
        )
        url = upload_result.response_metadata.raw.get("url") or upload_result.url
        return {"url": url}
    except Exception as e:
        b64 = base64.b64encode(file_bytes).decode("utf-8")
        data_uri = f"data:{file.content_type or 'image/jpeg'};base64,{b64}"
        return {"url": data_uri}

@router.post("/shops/{shop_id}/products", response_model=ProductRead)
def create_product(
    shop_id: int, 
    product_in: ProductCreate, 
    user = Depends(get_shop_owner), 
    session: Session = Depends(get_session)
):
    """Add a product to a shop. Must be the owner or Super Admin."""
    shop = shop_service.get_shop_by_id(session, shop_id)
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
        
    role = str(user.get("role", "")).upper()
    if role != "SUPER_ADMIN" and user.get("email") != "abdullrrafay@gmail.com":
        if shop.owner_clerk_id != user["id"] and user.get("shop_id") != shop.id:
            raise HTTPException(status_code=403, detail="You do not own this shop")
        
    product_data = product_in.dict(exclude={"image_urls", "variants"})
    product_data["shop_id"] = shop_id
    
    gallery = product_in.image_urls or []
    if product_in.image_url and product_in.image_url not in gallery:
        gallery.insert(0, product_in.image_url)
    
    variants = [v.dict() if hasattr(v, "dict") else v for v in (product_in.variants or [])]
    new_prod = product_service.create_product(session, product_data, gallery, variants)
    
    # Reload product with variants & images
    prod_loaded = session.exec(
        select(Product).where(Product.id == new_prod.id).options(
            selectinload(Product.images),
            selectinload(Product.variants)
        )
    ).first()
    return product_service.format_product_read(prod_loaded or new_prod, shop.name)

@router.get("/shops/{shop_id}/products", response_model=List[ProductRead])
def list_products(shop_id: int, session: Session = Depends(get_session)):
    """List products for a shop (Public)."""
    shop = session.get(Shop, shop_id)
    shop_name = shop.name if shop else f"Shop #{shop_id}"
    statement = select(Product).where(Product.shop_id == shop_id, Product.is_deleted == False).options(
        selectinload(Product.images),
        selectinload(Product.variants)
    )
    prods = session.exec(statement).all()
    return [product_service.format_product_read(p, shop_name) for p in prods]

@router.delete("/products/{product_id}")
def delete_product(product_id: int, user = Depends(get_shop_owner), session: Session = Depends(get_session)):
    """Delete a product. Must be owner."""
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    shop = shop_service.get_shop_by_id(session, product.shop_id)
    if not shop or shop.owner_clerk_id != user["id"]:
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
    image_urls: Optional[List[str]] = None
    main_category_id: Optional[int] = None
    sub_category_id: Optional[int] = None
    variants: Optional[List[dict]] = None

    @field_validator("main_category_id", "sub_category_id", mode="before")
    @classmethod
    def sanitize_cat_id(cls, v):
        if v == "" or v is None:
            return None
        try:
            return int(v)
        except (ValueError, TypeError):
            return None

    @field_validator("price", mode="before")
    @classmethod
    def sanitize_price(cls, v):
        if v is None or v == "":
            return None
        try:
            val = float(v)
            if math.isnan(val) or val < 0:
                return 0.0
            return val
        except (ValueError, TypeError):
            return 0.0

    @field_validator("stock_quantity", mode="before")
    @classmethod
    def sanitize_stock(cls, v):
        if v is None or v == "":
            return None
        try:
            val = float(v)
            if math.isnan(val) or val < 0:
                return 0
            return int(val)
        except (ValueError, TypeError):
            return 0

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
        
    data = update_data.dict(exclude_unset=True, exclude={"image_urls", "variants"})
    image_urls = update_data.image_urls
    variants = update_data.variants
    
    updated_prod = product_service.update_product(session, product, data, image_urls, variants)
    
    # Reload with relationships
    prod_loaded = session.exec(
        select(Product).where(Product.id == updated_prod.id).options(
            selectinload(Product.images),
            selectinload(Product.variants)
        )
    ).first()
    return product_service.format_product_read(prod_loaded or updated_prod, shop.name)
