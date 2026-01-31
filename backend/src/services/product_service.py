from sqlmodel import Session, select
from typing import List, Optional
from src.models.product import Product, ProductImage

def create_product(session: Session, product_data: dict, image_urls: List[str]) -> Product:
    """Create a product and its associated gallery images."""
    # 1. Create Product object
    product = Product(**product_data)
    session.add(product)
    session.flush() # Get product ID
    
    # 2. Create Image objects
    for url in image_urls:
        img = ProductImage(url=url, product_id=product.id)
        session.add(img)
        
    session.commit()
    session.refresh(product)
    return product

def get_product_by_id(session: Session, product_id: int) -> Optional[Product]:
    """Fetch a single product by ID."""
    return session.get(Product, product_id)

def get_products_by_shop(session: Session, shop_id: int) -> List[Product]:
    """List all products for a specific shop."""
    statement = select(Product).where(Product.shop_id == shop_id)
    return session.exec(statement).all()

def update_product(session: Session, product: Product, data: dict, image_urls: Optional[List[str]] = None) -> Product:
    """Update base product fields and optionally replace the image gallery."""
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
            
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

def delete_product(session: Session, product: Product):
    """Delete a product and all its associated gallery images."""
    # 1. Manually delete associated images first to avoid Foreign Key errors
    statement = select(ProductImage).where(ProductImage.product_id == product.id)
    images = session.exec(statement).all()
    for img in images:
        session.delete(img)
    
    # 2. Delete the product
    session.delete(product)
    session.commit()