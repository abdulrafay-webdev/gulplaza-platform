---
id: 101
title: Fix Wholesale Inventory Display and Add MOQ Feature
stage: green
date: 2026-10-20
surface: agent
model: gemini
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: user
command: null
labels: ["moq", "wholesale", "inventory", "product-details", "b2b", "checkout"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/migrate_wholesale.py
  - backend/src/models/product.py
  - backend/src/api/products.py
  - backend/src/auth/deps.py
  - backend/src/services/checkout_service.py
  - backend/test_wholesale_marketplace_suite.py
  - mobile-shared/src/types/index.ts
  - next-frontend/src/app/dashboard/products/page.tsx
  - next-frontend/src/app/dashboard/products/new/page.tsx
  - next-frontend/src/app/dashboard/products/[id]/edit/page.tsx
  - next-frontend/src/app/dashboard/wholesale/page.tsx
  - next-frontend/src/app/products/[id]/page.tsx
  - next-frontend/src/context/CartContext.tsx
tests:
  - python backend/test_wholesale_marketplace_suite.py
  - cd next-frontend; npm.cmd run build
---

## Prompt

seller dashboard may jo products show horahi hain us per click karnay per detailed page open nhi horaha , or wholesaler dashboard may inventory walay section may add hui wi products show nhi ho rahin , or ek feature or add karo wholesaler jab product add karay tou sath moq bhi add karay , taakay seller jab woh product order karay tou us moq jitni ya us say zyada hi order kar sakay

## Response snapshot

Addressed all three user requests:
1. Product Detail Access: Made product cards, thumbnails, titles, and added explicit 'View' action buttons in the seller dashboard (`/dashboard/products`) linking directly to `/products/[id]`. Updated backend endpoint `GET /products/{id}` to allow authorized wholesale owners and approved retail buyers to view wholesale items while continuing to return 404 for unauthenticated normal customers.
2. Wholesaler Inventory Display: Updated `GET /shops/{shop_id}/products` to allow wholesale shop owners to retrieve their wholesale catalog in the dashboard inventory section.
3. Minimum Order Quantity (MOQ) Feature:
   - Added `moq` column (`INTEGER DEFAULT 1`) to `Product` table and models.
   - Added MOQ input field to product creation (`/dashboard/products/new`) and editing (`/dashboard/products/[id]/edit`) forms.
   - Enforced MOQ in `checkout_service.py` (rejects orders where `quantity < moq` with HTTP 400).
   - Enforced MOQ in Cart context and product detail quantity selector (stepper cannot drop below MOQ, initial qty defaults to MOQ).
   - Displayed MOQ badges in Wholesale Marketplace (`/dashboard/wholesale`) and product details.
4. Verified via comprehensive automated test suite and Next.js production build, all passing 100%.

## Outcome

- ✅ Impact: Wholesalers can now see their listed products in inventory, view detailed pages, specify MOQ on items, and retail buyers are strictly enforced to purchase >= MOQ.
- 🧪 Tests: 100% pass on wholesale test suite (Tests A-I including MOQ enforcement) and Next.js 16 build.
- 📁 Files: 13 files updated across backend, shared types, and web frontend.
- 🔁 Next prompts: None.
- 🧠 Reflection: Allowing authorized sellers to view their own wholesale product details on `/products/[id]` while strictly returning 404 to anonymous shoppers achieved both convenience and catalog isolation.

## Evaluation notes (flywheel)

- Failure modes observed: Duplicate code block in page.tsx caught by Turbopack build and fixed immediately.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Push changes to GitHub repository.
