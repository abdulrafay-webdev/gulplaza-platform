from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .db.session import init_db
from contextlib import asynccontextmanager
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="Gul Plaza API", version="1.0.0", lifespan=lifespan)

# Mount Uploads
# Use absolute path to ensure correct resolution
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS Configuration
origins = [
    "http://localhost:5173", # Vite default
    "http://127.0.0.1:5173",
    "http://localhost:3000", # Next.js default
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import APIRouter
from .api import shops, products, checkout, orders, admin, categories

api_router = APIRouter()

api_router.include_router(shops.router, prefix="/shops", tags=["shops"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(products.router, tags=["products"])
api_router.include_router(checkout.router, prefix="/cart", tags=["checkout"])
api_router.include_router(orders.router, tags=["orders"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])

@api_router.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(api_router, prefix="/api/v1")
