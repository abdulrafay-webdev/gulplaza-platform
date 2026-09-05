from sqlmodel import Session, select
from typing import List, Optional
from src.models.product import Product, ProductImage, ProductVariant, ProductRead

def format_product_read(p: Product, shop_name: Optional[str] = None) -> ProductRead:
    """Format a Product into ProductRead with has_variants, min_price, and max_price."""
    active_variants = [v for v in (p.variants or []) if v.is_active]
    has_variants = len(active_variants) > 0
    if has_variants:
        prices = [v.price for v in active_variants]
        min_price = min(prices)
        max_price = max(prices)
    else:
        min_price = p.price
        max_price = p.price

    return ProductRead.model_validate(
        p,
        update={
            "shop_name": shop_name,
            "has_variants": has_variants,
            "min_price": min_price,
            "max_price": max_price,
            "variants": active_variants
        }
    )

def create_product(session: Session, product_data: dict, image_urls: List[str], variants: Optional[List[dict]] = None) -> Product:
    """Create a product, its associated gallery images, and optional variants."""
    # 1. Create Product object
    product = Product(**product_data)
    session.add(product)
    session.flush() # Get product ID
    
    # 2. Create Image objects
    for url in image_urls:
        img = ProductImage(url=url, product_id=product.id)
        session.add(img)

    # 3. Create Variant objects
    if variants:
        for v in variants:
            v_name = v.get("name", "").strip() if isinstance(v, dict) else getattr(v, "name", "").strip()
            if not v_name:
                continue
            v_price = float(v.get("price", product.price) if isinstance(v, dict) else getattr(v, "price", product.price))
            v_stock = int(v.get("stock_quantity", 0) if isinstance(v, dict) else getattr(v, "stock_quantity", 0))
            var = ProductVariant(
                product_id=product.id,
                name=v_name,
                price=v_price,
                stock_quantity=v_stock,
                is_active=True
            )
            session.add(var)
        
    session.commit()
    session.refresh(product)
    return product

def get_product_by_id(session: Session, product_id: int) -> Optional[Product]:
    """Fetch a single product by ID, if not deleted."""
    product = session.get(Product, product_id)
    if product and product.is_deleted:
        return None
    return product

def get_products_by_shop(session: Session, shop_id: int) -> List[Product]:
    """List all active (non-deleted) products for a specific shop."""
    statement = select(Product).where(Product.shop_id == shop_id, Product.is_deleted == False)
    return session.exec(statement).all()

def search_products(session: Session, query: str, limit: int = 10) -> List[Product]:
    """Search products by name or description."""
    statement = select(Product).where(
        Product.is_deleted == False,
        (Product.name.ilike(f"%{query}%")) | (Product.short_description.ilike(f"%{query}%"))
    ).limit(limit)
    return session.exec(statement).all()

def update_product(session: Session, product: Product, data: dict, image_urls: Optional[List[str]] = None, variants: Optional[List[dict]] = None) -> Product:
    """Update base product fields and optionally replace the image gallery and variants."""
    # Update base fields
    for key, value in data.items():
        if hasattr(product, key):
            setattr(product, key, value)
    
    # Update images if provided (Gallery replacement)
    if image_urls is not None:
        # Delete old images
        statement = select(ProductImage).where(ProductImage.product_id == product.id)
        old_images = session.exec(statement).all()
        for img in old_images:
            session.delete(img)
        
        # Add new ones
        for url in image_urls:
            new_img = ProductImage(url=url, product_id=product.id)
            session.add(new_img)

    # Update variants if provided
    if variants is not None:
        var_stmt = select(ProductVariant).where(ProductVariant.product_id == product.id)
        old_vars = session.exec(var_stmt).all()
        for old_v in old_vars:
            session.delete(old_v)
        
        for v in variants:
            v_name = v.get("name", "").strip() if isinstance(v, dict) else getattr(v, "name", "").strip()
            if not v_name:
                continue
            v_price = float(v.get("price", product.price) if isinstance(v, dict) else getattr(v, "price", product.price))
            v_stock = int(v.get("stock_quantity", 0) if isinstance(v, dict) else getattr(v, "stock_quantity", 0))
            var = ProductVariant(
                product_id=product.id,
                name=v_name,
                price=v_price,
                stock_quantity=v_stock,
                is_active=True
            )
            session.add(var)
            
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

def delete_product(session: Session, product: Product):
    """Soft delete a product by setting is_deleted=True."""
    product.is_deleted = True
    session.add(product)
    session.commit()