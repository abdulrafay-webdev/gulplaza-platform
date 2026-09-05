from sqlmodel import create_engine, SQLModel, Session
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

SQL_ECHO = os.getenv("SQL_ECHO", "false").lower() == "true"

if DATABASE_URL:
    engine = create_engine(DATABASE_URL, echo=SQL_ECHO, pool_pre_ping=True)
else:
    # Fallback to in-memory SQLite so app starts up cleanly without crashing on import
    engine = create_engine("sqlite:///:memory:", echo=False)

def get_session():
    if not os.getenv("DATABASE_URL"):
        from fastapi import HTTPException
        raise HTTPException(
            status_code=503, 
            detail="Database not configured: please set DATABASE_URL in Vercel environment variables"
        )
    with Session(engine) as session:
        yield session

def init_db():
    # Import models here to ensure they are registered on the metadata
    from src.models.user import User
    from src.models.shop import Shop
    from src.models.category import Category, SubCategory # Import categories first
    from src.models.product import Product, ProductImage, ProductVariant
    from src.models.customer import Customer
    from src.models.order import Order
    from src.models.review import Review
    from src.models.ai_chat import AIChat, AIMessage
    
    SQLModel.metadata.create_all(engine)
