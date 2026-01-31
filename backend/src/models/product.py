from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .shop import Shop
    from .category import Category, SubCategory

class ProductImage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    url: str
    product_id: int = Field(foreign_key="product.id")
    
    product: "Product" = Relationship(back_populates="images")

class ProductBase(SQLModel):
    name: str
    price: float = Field(ge=0)
    stock_quantity: int = Field(default=0, ge=0)
    image_url: Optional[str] = None # Thumbnail
    is_active: bool = True
    is_deleted: bool = False # New field for soft delete
    
    # New Fields
    short_description: str = Field(default="No short description")
    long_description: str = Field(default="No long description")
    
    # Foreign Keys
    main_category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    sub_category_id: Optional[int] = Field(default=None, foreign_key="subcategory.id")

class Product(ProductBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    shop_id: int = Field(foreign_key="shop.id")
    
    shop: "Shop" = Relationship(back_populates="products")
    main_category: Optional["Category"] = Relationship(back_populates="products")
    sub_category: Optional["SubCategory"] = Relationship(back_populates="products")
    images: List[ProductImage] = Relationship(
        back_populates="product", 
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

# API Schemas
class ProductCreate(ProductBase):
    image_urls: List[str] = [] # List of ImageKit URLs

class ProductImageRead(SQLModel):
    id: int
    url: str

class ProductRead(ProductBase):
    id: int
    shop_id: int
    images: List[ProductImageRead] = []


