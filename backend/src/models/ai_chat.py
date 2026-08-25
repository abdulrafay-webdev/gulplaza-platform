from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, Any
from datetime import datetime

class AIChatBase(SQLModel):
    title: str = Field(default="Shopping Assistant Chat")
    user_identity: str = Field(index=True)
    user_type: str = Field(default="customer")

class AIChat(AIChatBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    messages: List["AIMessage"] = Relationship(
        back_populates="chat",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "order_by": "AIMessage.created_at"}
    )

class AIMessageBase(SQLModel):
    chat_id: int = Field(foreign_key="aichat.id", index=True)
    role: str # "user", "assistant", "system"
    content: str
    message_type: str = Field(default="text") # "text", "product_recommendation", "image", "mixed"
    image_url: Optional[str] = None
    product_ids_json: Optional[str] = None # JSON string: "[1, 2, 3]"
    metadata_json: Optional[str] = None

class AIMessage(AIMessageBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    chat: Optional[AIChat] = Relationship(back_populates="messages")

class AIDemandInsight(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    query_text: str = Field(index=True)
    category_hint: Optional[str] = Field(default=None, index=True)
    request_count: int = Field(default=1)
    had_direct_match: bool = Field(default=True)
    last_requested_at: datetime = Field(default_factory=datetime.utcnow)

# API Schemas
class AIChatCreate(SQLModel):
    initial_message: Optional[str] = None
    image_url: Optional[str] = None

class AIChatUpdate(SQLModel):
    title: str

class AIMessageCreate(SQLModel):
    content: str
    image_url: Optional[str] = None

class AIMessageRead(AIMessageBase):
    id: int
    created_at: datetime
    products: List[Any] = []

class AIChatRead(AIChatBase):
    id: int
    created_at: datetime
    updated_at: datetime
    messages_count: int = 0
    last_message: Optional[str] = None

class AIChatDetailRead(AIChatBase):
    id: int
    created_at: datetime
    updated_at: datetime
    messages: List[AIMessageRead] = []
