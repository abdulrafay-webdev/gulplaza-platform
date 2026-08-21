from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class ReviewBase(SQLModel):
    product_id: int = Field(foreign_key="product.id")
    reviewer_name: str
    reviewer_email: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    comment: str
    is_verified_purchase: bool = True

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

class ProductRatingSummary(SQLModel):
    average_rating: float
    total_reviews: int
    rating_distribution: dict
