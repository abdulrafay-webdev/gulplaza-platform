from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

from .shop import Shop
from .category import Category, SubCategory

class ProductImage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    url: str
    product_id: int = Field(foreign_key="product.id")
    
    product: "Product" = Relationship(back_populates="images")

class ProductVariant(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.id")
    name: str
    price: float = Field(ge=0)
    stock_quantity: int = Field(default=0, ge=0)
    is_active: bool = True
    
    product: Optional["Product"] = Relationship(back_populates="variants")

import math
from pydantic import field_validator

class ProductBase(SQLModel):
    name: str
    price: Optional[float] = Field(default=0.0, ge=0)
    stock_quantity: Optional[int] = Field(default=0, ge=0)
    image_url: Optional[str] = None # Thumbnail
    is_active: bool = True
    is_deleted: bool = False # New field for soft delete
    
    # Descriptions (permissive to prevent 422 on null/empty)
    short_description: Optional[str] = Field(default="No short description")
    long_description: Optional[str] = Field(default="No long description")
    
    # Foreign Keys
    main_category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    sub_category_id: Optional[int] = Field(default=None, foreign_key="subcategory.id")

    @field_validator("main_category_id", "sub_category_id", mode="before")
    @classmethod
    def sanitize_category_id(cls, v):
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
            return 0.0
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
            return 0
        try:
            val = float(v)
            if math.isnan(val) or val < 0:
                return 0
            return int(val)
        except (ValueError, TypeError):
            return 0

    @field_validator("short_description", "long_description", mode="before")
    @classmethod
    def sanitize_description(cls, v):
        if v is None or not str(v).strip():
            return "No description provided"
        return str(v).strip()

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
    variants: List[ProductVariant] = Relationship(
        back_populates="product", 
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

# API Schemas
class ProductVariantCreate(SQLModel):
    id: Optional[int] = None
    name: str = "Standard"
    price: Optional[float] = Field(default=0.0, ge=0)
    stock_quantity: Optional[int] = Field(default=0, ge=0)

    @field_validator("name", mode="before")
    @classmethod
    def sanitize_v_name(cls, v):
        if not v or not str(v).strip():
            return "Standard"
        return str(v).strip()

    @field_validator("price", mode="before")
    @classmethod
    def sanitize_v_price(cls, v):
        if v is None or v == "":
            return 0.0
        try:
            val = float(v)
            if math.isnan(val) or val < 0:
                return 0.0
            return val
        except (ValueError, TypeError):
            return 0.0

    @field_validator("stock_quantity", mode="before")
    @classmethod
    def sanitize_v_stock(cls, v):
        if v is None or v == "":
            return 0
        try:
            val = float(v)
            if math.isnan(val) or val < 0:
                return 0
            return int(val)
        except (ValueError, TypeError):
            return 0

class ProductVariantRead(SQLModel):
    id: int
    product_id: int
    name: str
    price: float
    stock_quantity: int
    is_active: bool

class ProductCreate(ProductBase):
    image_urls: List[str] = [] # List of ImageKit URLs
    variants: Optional[List[ProductVariantCreate]] = []

class ProductImageRead(SQLModel):
    id: int
    url: str

class ProductRead(ProductBase):
    id: int
    shop_id: int
    shop_name: Optional[str] = None
    images: List[ProductImageRead] = []
    variants: List[ProductVariantRead] = []
    has_variants: bool = False
    min_price: Optional[float] = None
    max_price: Optional[float] = None


