from sqlmodel import SQLModel, Field
from typing import Optional

class UserBase(SQLModel):
    email: Optional[str] = None
    role: str

class User(UserBase, table=True):
    id: str = Field(primary_key=True) # Clerk ID
    is_active: bool = True
