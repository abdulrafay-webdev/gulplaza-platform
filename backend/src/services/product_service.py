from sqlmodel import Session, select
from typing import List, Optional
import math
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
    # 1. Sanitize base product data
    if not product_data.get("short_description"):
        product_data["short_description"] = "No short description"
    if not product_data.get("long_description"):
        product_data["long_description"] = "No long description"
    if product_data.get("price") is None:
        product_data["price"] = 0.0
    if product_data.get("stock_quantity") is None:
        product_data["stock_quantity"] = 0

    # 2. Create Product object
    product = Product(**product_data)
    session.add(product)
    session.flush() # Get product ID
    
    # 3. Create Image objects
    for url in (image_urls or []):
        if url and str(url).strip():
            img = ProductImage(url=str(url).strip(), product_id=product.id)
            session.add(img)

    # 4. Create Variant objects safely
    if variants:
        for v in variants:
            v_name = v.get("name", "").strip() if isinstance(v, dict) else getattr(v, "name", "").strip()
            if not v_name:
                continue
            
            raw_price = v.get("price") if isinstance(v, dict) else getattr(v, "price", None)
            try:
                v_price = float(raw_price) if raw_price is not None else float(product.price or 0.0)
                if math.isnan(v_price) or v_price < 0:
                    v_price = float(product.price or 0.0)
            except (ValueError, TypeError):
                v_price = float(product.price or 0.0)

            raw_stock = v.get("stock_quantity") if isinstance(v, dict) else getattr(v, "stock_quantity", None)
            try:
                v_stock = int(raw_stock) if raw_stock is not None else 0
                if v_stock < 0:
                    v_stock = 0
            except (ValueError, TypeError):
                v_stock = 0

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
            if key == "short_description" and not value:
                value = "No short description"
            elif key == "long_description" and not value:
                value = "No long description"
            elif key == "price" and (value is None or (isinstance(value, float) and math.isnan(value))):
                value = 0.0
            elif key == "stock_quantity" and value is None:
                value = 0
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
            if url and str(url).strip():
                new_img = ProductImage(url=str(url).strip(), product_id=product.id)
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
            raw_p = v.get("price") if isinstance(v, dict) else getattr(v, "price", None)
            try:
                v_price = float(raw_p) if raw_p is not None else float(product.price or 0.0)
                if math.isnan(v_price) or v_price < 0:
                    v_price = float(product.price or 0.0)
            except (ValueError, TypeError):
                v_price = float(product.price or 0.0)

            raw_s = v.get("stock_quantity") if isinstance(v, dict) else getattr(v, "stock_quantity", None)
            try:
                v_stock = int(raw_s) if raw_s is not None else 0
                if v_stock < 0:
                    v_stock = 0
            except (ValueError, TypeError):
                v_stock = 0

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