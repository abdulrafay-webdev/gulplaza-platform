from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
from sqlalchemy.orm import selectinload

from src.db.session import get_session
from src.models.product import Product, ProductRead
from src.models.shop import Shop
from src.models.order import Order, OrderRead
from src.services import product_service, shop_service
from src.auth.deps import get_approved_retail_seller

router = APIRouter()

@router.get("/products", response_model=List[ProductRead])
def list_wholesale_products(
    limit: int = 50,
    offset: int = 0,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    user = Depends(get_approved_retail_seller),
    session: Session = Depends(get_session)
):
    """
    List wholesale products for B2B sourcing.
    STRICT ACCESS: Only authenticated + approved Retail Sellers (and Super Admin).
    """
    query = select(Product).where(
        Product.is_deleted == False,
        Product.is_active == True,
        Product.product_type == "WHOLESALE"
    ).options(
        selectinload(Product.images),
        selectinload(Product.variants)
    )

    if search:
        query = query.where(
            (Product.name.ilike(f"%{search}%")) | (Product.short_description.ilike(f"%{search}%"))
        )

    if category_id:
        query = query.where(Product.main_category_id == category_id)

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
        product_service.format_product_read(p, shop_map.get(p.shop_id, f"Wholesale Shop #{p.shop_id}"))
        for p in prods
    ]

@router.get("/products/{product_id}", response_model=ProductRead)
def get_wholesale_product(
    product_id: int,
    user = Depends(get_approved_retail_seller),
    session: Session = Depends(get_session)
):
    """
    Get detailed view of a wholesale bulk product.
    STRICT ACCESS: Only authenticated + approved Retail Sellers (and Super Admin).
    """
    product = session.exec(
        select(Product).where(
            Product.id == product_id,
            Product.is_deleted == False,
            Product.product_type == "WHOLESALE"
        ).options(
            selectinload(Product.images),
            selectinload(Product.variants)
        )
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Wholesale product not found")

    shop = session.get(Shop, product.shop_id)
    shop_name = shop.name if shop else f"Wholesale Shop #{product.shop_id}"
    return product_service.format_product_read(product, shop_name)

@router.get("/shops", response_model=List[Shop])
def list_wholesale_vendors(
    user = Depends(get_approved_retail_seller),
    session: Session = Depends(get_session)
):
    """
    List verified wholesale vendors available for B2B sourcing.
    STRICT ACCESS: Only authenticated + approved Retail Sellers (and Super Admin).
    """
    statement = select(Shop).where(
        Shop.seller_type == "WHOLESALE",
        Shop.is_approved == True,
        Shop.is_active == True
    )
    return session.exec(statement).all()

@router.get("/shops/{shop_id}", response_model=Shop)
def get_wholesale_vendor(
    shop_id: int,
    user = Depends(get_approved_retail_seller),
    session: Session = Depends(get_session)
):
    """Get wholesale vendor profile."""
    shop = session.get(Shop, shop_id)
    if not shop or getattr(shop, "seller_type", None) != "WHOLESALE":
        raise HTTPException(status_code=404, detail="Wholesale vendor not found")
    return shop

@router.get("/orders", response_model=List[OrderRead])
def list_my_wholesale_purchases(
    user = Depends(get_approved_retail_seller),
    session: Session = Depends(get_session)
):
    """
    List wholesale sourcing purchase orders placed by the authenticated Retail Seller.
    """
    user_id = str(user.get("id"))
    buyer_shop_id = user.get("shop_id")

    query = select(Order).where(Order.order_type == "WHOLESALE")
    if buyer_shop_id:
        query = query.where(
            (Order.buyer_shop_id == buyer_shop_id) | (Order.customer_clerk_id == user_id)
        )
    else:
        query = query.where(Order.customer_clerk_id == user_id)

    orders = session.exec(query.order_by(Order.created_at.desc())).all()
    if not orders:
        return []

    shop_ids = list({o.shop_id for o in orders if o.shop_id})
    shop_map = {}
    if shop_ids:
        shops = session.exec(select(Shop).where(Shop.id.in_(shop_ids))).all()
        shop_map = {s.id: s.name for s in shops}

    return [
        OrderRead.model_validate(o, update={"shop_name": shop_map.get(o.shop_id, f"Wholesale Shop #{o.shop_id}")})
        for o in orders
    ]
