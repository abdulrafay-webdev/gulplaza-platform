# Quickstart: Gul Plaza Baseline

## Prerequisites
- Python 3.10+
- Node.js 18+ (for Frontend)
- PostgreSQL Database (Neon)
- Clerk Account

## Environment Setup
1. Copy `.env.example` to `.env`.
2. Fill in:
   ```bash
   DATABASE_URL=postgresql://user:pass@ep-xyz.neon.tech/neondb
   CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

## Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

## Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

## First Run
1. Go to `http://localhost:5173`.
2. Sign Up via Clerk.
3. If you want to be a Shop Owner, update your Clerk metadata (via Admin dashboard or setup flow).
4. Create a Shop.
