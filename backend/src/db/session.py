from sqlmodel import create_engine, SQLModel, Session
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

# Neon requires sslmode=require usually, which is in the URL.
# If using async engine, might need modifications, but plan implies standard sync/FastAPI for simplicity unless specified.
# Plan said "FastAPI + SQLModel". Sync is simpler for baseline.

engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session

def init_db():
    # Import models here to ensure they are registered on the metadata
    from src.models.user import User
    from src.models.shop import Shop
    from src.models.category import Category, SubCategory # Import categories first
    from src.models.product import Product, ProductImage
    from src.models.customer import Customer
    from src.models.order import Order
    
    SQLModel.metadata.create_all(engine)
