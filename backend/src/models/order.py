from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from enum import Enum

if TYPE_CHECKING:
    from .customer import Customer

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class OrderItem(SQLModel, table=True):
    # ... (existing fields)
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="order.id")
    product_id: int = Field(foreign_key="product.id")
    variant_name: Optional[str] = Field(default=None)
    variant_id: Optional[int] = Field(default=None)
    quantity: int
    price_at_purchase: float
    
    order: "Order" = Relationship(back_populates="items")
    product: "Product" = Relationship() # Enable product fetch

class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    shop_id: int = Field(foreign_key="shop.id")
    customer_clerk_id: Optional[str] = Field(default=None, index=True) # Optional for Guest/Clerk
    customer_id: Optional[int] = Field(default=None, foreign_key="customer.id") # Link to Neon Customer
    
    # Guest Details
    guest_name: Optional[str] = None
    guest_email: Optional[str] = None
    guest_phone: Optional[str] = None
    guest_address: Optional[str] = None
    
    status: str = Field(default=OrderStatus.PENDING)
    total_amount: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    items: List["OrderItem"] = Relationship(back_populates="order")
    customer: Optional["Customer"] = Relationship(back_populates="orders")

# Read Models
class ProductRead(SQLModel):
    id: int
    name: str
    price: float
    image_url: Optional[str] = None

class OrderItemRead(SQLModel):
    id: int
    product_id: int
    variant_name: Optional[str] = None
    variant_id: Optional[int] = None
    quantity: int
    price_at_purchase: float
    product: Optional[ProductRead] = None

class OrderRead(SQLModel):
    id: int
    shop_id: int
    shop_name: Optional[str] = None
    customer_clerk_id: Optional[str]
    guest_name: Optional[str]
    guest_email: Optional[str]
    guest_phone: Optional[str]
    guest_address: Optional[str]
    status: str
    total_amount: float
    created_at: datetime
    items: List[OrderItemRead] = []
