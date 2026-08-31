from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class UserBase(SQLModel):
    email: Optional[str] = Field(default=None, index=True)
    phone: Optional[str] = Field(default=None, index=True)
    full_name: Optional[str] = None
    role: str = Field(default="SELLER") # "SUPER_ADMIN", "SELLER"
    is_active: bool = Field(default=True)
    shop_id: Optional[int] = Field(default=None)

class User(UserBase, table=True):
    id: str = Field(primary_key=True) # Unique ID e.g. "admin_1", "seller_38gxODtYHX..."
    hashed_password: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
