# Gul Plaza Marketplace (MVP)

Multi-shop ordering platform built with FastAPI, React, and Neon.

## Features

- **Multi-Shop Architecture**: Each shop has isolated data and dashboard.
- **Customer Experience**: Browse shops, multi-shop cart, split-order checkout.
- **Order Fulfillment**: Shop owners manage their own orders.
- **Security**: Role-based access (Clerk) and data isolation.

## Tech Stack

- **Backend**: FastAPI, SQLModel, Alembic
- **Database**: Neon (PostgreSQL)
- **Frontend**: React, Vite, TailwindCSS
- **Authentication**: Clerk

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Neon Database URL
- Clerk API Keys

### Backend Setup

1. Navigate to backend:
   ```bash
   cd backend
   ```
2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure `.env`:
   ```env
   DATABASE_URL=...
   CLERK_PUBLISHABLE_KEY=...
   CLERK_SECRET_KEY=...
   ```
5. Run Migrations:
   ```bash
   alembic upgrade head
   ```
6. Start Server:
   ```bash
   uvicorn src.main:app --reload
   ```

### Frontend Setup

1. Navigate to frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env`:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=...
   ```
4. Start Dev Server:
   ```bash
   npm run dev
   ```

## Usage

1. Open `http://localhost:5173`.
2. **Sign In** (Clerk).
3. **Shop Owner**: Go to Dashboard (link appears if signed in), Create Shop, Add Products.
4. **Customer**: Browse Shops from Home, Add to Cart, Checkout.
