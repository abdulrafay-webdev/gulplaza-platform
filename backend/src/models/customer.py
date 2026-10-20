from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

if TYPE_CHECKING:
    from .order import Order

class CustomerBase(SQLModel):
    full_name: str
    email: Optional[str] = Field(default=None, index=True, unique=True)
    phone: Optional[str] = Field(default=None, index=True, unique=True)
    created_at: datetime = Field(default_factory=get_utc_now)

class Customer(CustomerBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    
    orders: List["Order"] = Relationship(back_populates="customer")
