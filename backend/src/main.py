from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
# Import using absolute paths
from src.db.session import init_db
from contextlib import asynccontextmanager
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # In serverless environments, DB tables are already migrated.
    # Running SQLModel create_all on every serverless cold start causes 10-15s latency and timeouts.
    if os.getenv("RUN_DB_INIT", "false").lower() == "true":
        try:
            init_db()
        except Exception as e:
            print(f"DB Init Error: {e}")
    yield

app = FastAPI(title="AI Plaza API", version="1.0.0", lifespan=lifespan)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://gulplaza-frontend.vercel.app",
    "https://gulplaza-platform-frontend.vercel.app",
    "https://gulplaza-platform.vercel.app",
]

extra = os.getenv("CORS_ALLOW_ORIGINS", "")
origins += [o.strip() for o in extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from src.api import shops, products, checkout, orders, admin, categories, customers, search, reviews, ai_chat, auth

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(ai_chat.router, prefix="/ai", tags=["ai"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(shops.router, prefix="/shops", tags=["shops"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(products.router, tags=["products"])
api_router.include_router(reviews.router, tags=["reviews"])
api_router.include_router(checkout.router, prefix="/cart", tags=["checkout"])
api_router.include_router(orders.router, tags=["orders"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])

@api_router.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"status": "ok", "service": "AI Plaza API"}

@app.get("/health")
def root_health():
    return {"status": "ok"}

