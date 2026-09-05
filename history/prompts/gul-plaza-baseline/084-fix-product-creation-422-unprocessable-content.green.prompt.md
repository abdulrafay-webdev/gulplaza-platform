---
id: 084
title: Fix Product Creation 422 Unprocessable Content
stage: green
date: 2026-09-05
surface: agent
model: inherit
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: yousuf
command: agent
labels: ["fastapi", "pydantic", "validation", "product-creation", "variants", "nextjs"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/models/product.py
  - backend/src/api/products.py
  - backend/src/services/product_service.py
  - next-frontend/src/app/dashboard/products/new/page.tsx
  - next-frontend/src/app/dashboard/products/[id]/edit/page.tsx
  - apps/seller-mobile/src/screens/AddProductScreen.tsx
tests:
  - npm run build (next-frontend)
  - python -c "from src.models.product import ProductCreate, ProductVariantCreate" (edge case validation)
  - python TestClient POST /api/v1/shops/1/products (end-to-end integration test)
---

### User Prompt
```text
7c5b2a9abf13fec0.js:1 
 POST https://gulplaza-platform.vercel.app/api/v1/shops/7/products 422 (Unprocessable Content)
(anonymous)	@	7c5b2a9abf13fec0.js:1
xhr	@	7c5b2a9abf13fec0.js:1
e4	@	7c5b2a9abf13fec0.js:1
_request	@	7c5b2a9abf13fec0.js:1
request	@	7c5b2a9abf13fec0.js:1
(anonymous)	@	7c5b2a9abf13fec0.js:1
(anonymous)	@	7c5b2a9abf13fec0.js:1
create	@	7c5b2a9abf13fec0.js:1
I	@	8da499287b5ec68b.js:1
await in I		
sY	@	94e29e6a8629e3e3.js:1
(anonymous)	@	94e29e6a8629e3e3.js:1
tD	@	94e29e6a8629e3e3.js:1
s3	@	94e29e6a8629e3e3.js:1
fC	@	94e29e6a8629e3e3.js:1
fP	@	94e29e6a8629e3e3.js:1
```

### Assistant Response
Identified root causes of 422 Unprocessable Content when adding or updating products:
1. ProductBase and ProductVariantCreate had strict non-optional types or lacked pre-validation sanitization for null, NaN (which serializes to null in JSON), and empty strings for category foreign keys and descriptions.
2. In Next.js frontend (new/page.tsx and [id]/edit/page.tsx), clearing price/stock input fields evaluated parseFloat("") or parseInt("") to NaN, which Axios serialized as null, violating Pydantic type constraints.
3. In product_service.py, v.get("stock_quantity", 0) returned None when explicitly passed {"stock_quantity": null}, leading to server crashes on int(None).

Resolved across the platform:
- Added @field_validator hooks with mode="before" in backend/src/models/product.py and backend/src/api/products.py to automatically convert empty strings to None, sanitize NaN/negative/null price and stock to safe numbers, and provide default strings for descriptions.
- Sanitized payload generation in next-frontend and seller-mobile so only clean, valid numbers and non-empty variants are submitted.
- Added comprehensive error message extraction from FastAPI responses (err.response.data.detail) to alert users clearly instead of generic errors.
- Verified Next.js production build (npm run build) passed with 29/29 routes statically/dynamically rendered.
- Executed end-to-end FastAPI TestClient integration test verifying POST /api/v1/shops/{shop_id}/products succeeds with HTTP 200 even with missing/empty fields.
