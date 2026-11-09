---
id: 102
title: Purge Test Products and Isolate Related Products
stage: green
date: 2026-11-09
surface: agent
model: gemini
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: user
command: null
labels: ["database-cleanup", "wholesale", "retail", "related-products", "isolation", "catalog"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/api/products.py
  - backend/test_wholesale_marketplace_suite.py
  - next-frontend/src/app/products/[id]/page.tsx
  - next-frontend/src/services/api.ts
tests:
  - python backend/test_wholesale_marketplace_suite.py
  - cd next-frontend; npm.cmd run build
---

## Prompt

Single Wireless Earbuds is name say bohot saari products list hui wi hain or ye bhi nhi pata chal raha k konsay store ki hain tou usay delete karo , seller panel may jo products show horahi hain wholesale wali jab koi product open karo tou neechay relatable may retailer ki products show horahi hain ye issue bhi solve karo

## Response snapshot

Addressed both requested fixes:
1. Purged all "Single Wireless Earbuds" test products (and their associated test shops, test users, and test orders) from the Neon PostgreSQL database. Also purged leftover test wholesale earbuds lots from earlier test runs and added automatic cleanup in `test_wholesale_marketplace_suite.py` so future test runs clean up after themselves.
2. Fixed Related Products catalog isolation:
   - Added `GET /api/v1/products/{product_id}/related` endpoint in `backend/src/api/products.py` with strict Retail vs. Wholesale separation.
   - For WHOLESALE products: Only other active WHOLESALE products are returned. Retailer items are never returned.
   - For RETAIL products: Only active RETAIL products are returned. Wholesale items are never returned.
   - Updated `next-frontend/src/app/products/[id]/page.tsx` and `api.ts` to call `products.getRelated(id)` and format wholesale related items with MOQ badge and wholesale styling.
3. Automated test suite (Tests A-J) passed 100%, and Next.js production build succeeded with zero errors.

## Outcome

- ✅ Impact: Unwanted test earbuds products deleted, and related products now strictly adhere to wholesale vs retail catalog boundaries.
- 🧪 Tests: 100% pass on wholesale test suite (including Test J for related products isolation and cleanup) and Next.js 16 build.
- 📁 Files: `backend/src/api/products.py`, `backend/test_wholesale_marketplace_suite.py`, `next-frontend/src/app/products/[id]/page.tsx`, `next-frontend/src/services/api.ts`.
- 🔁 Next prompts: None.
- 🧠 Reflection: Creating a dedicated server-side related products endpoint guarantees catalog isolation cannot be bypassed or diluted by frontend fallback slices.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Push to GitHub to trigger Vercel CI/CD redeployment.
