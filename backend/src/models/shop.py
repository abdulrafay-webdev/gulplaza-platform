from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .product import Product

class ShopBase(SQLModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None # Legacy/Thumbnail
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_active: bool = True
    is_approved: bool = False  # New field for admin approval

class Shop(ShopBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_clerk_id: str = Field(index=True)
    
    products: List["Product"] = Relationship(back_populates="shop")
