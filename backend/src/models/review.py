from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .product import Product
    from .shop import Shop

class ReviewBase(SQLModel):
    product_id: int = Field(foreign_key="product.id", index=True)
    shop_id: Optional[int] = Field(default=None, foreign_key="shop.id", index=True)
    reviewer_name: str
    reviewer_email: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    comment: str
    is_verified_purchase: bool = True
    is_approved: bool = Field(default=False) # Requires shop owner approval

class Review(ReviewBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReviewCreate(SQLModel):
    reviewer_name: str
    reviewer_email: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    comment: str

class ReviewRead(ReviewBase):
    id: int
    created_at: datetime
    product_name: Optional[str] = None
    product_image: Optional[str] = None

class ProductRatingSummary(SQLModel):
    average_rating: float
    total_reviews: int
    rating_distribution: dict
