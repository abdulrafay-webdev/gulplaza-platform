from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .product import Product
    from .shop import Shop

# --- MAIN CATEGORY (Admin Managed) ---
class CategoryBase(SQLModel):
    name: str = Field(index=True, unique=True)
    description: Optional[str] = None
    is_active: bool = True

class Category(CategoryBase, table=True):
    __tablename__ = "category"
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Relationships
    sub_categories: List["SubCategory"] = Relationship(back_populates="main_category")
    products: List["Product"] = Relationship(back_populates="main_category")

# --- SUB CATEGORY (Shop Managed) ---
class SubCategoryBase(SQLModel):
    name: str
    shop_id: int = Field(foreign_key="shop.id")
    main_category_id: int = Field(foreign_key="category.id")

class SubCategory(SubCategoryBase, table=True):
    __tablename__ = "subcategory"
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Relationships
    main_category: Category = Relationship(back_populates="sub_categories")
    shop: "Shop" = Relationship()
    products: List["Product"] = Relationship(back_populates="sub_category")
