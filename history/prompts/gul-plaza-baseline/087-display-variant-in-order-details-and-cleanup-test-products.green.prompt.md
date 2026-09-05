---
id: "087"
title: "Display Variant in Order Details and Cleanup Test Products"
stage: "green"
date: "2026-09-05"
surface: "agent"
model: "inherit"
feature: "gul-plaza-baseline"
branch: "1-gul-plaza-baseline"
user: "abdulrafay-webdev"
command: "order detail variant name display, mobile app verification, and test products deletion"
labels: ["variants", "order-details", "mobile-app", "database-migration", "cleanup"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
  conversation: "conversation://8de147ad-2ed8-4ec5-9fcc-91f6fe87cbc7"
files:
  - backend/src/models/order.py
  - backend/src/api/checkout.py
  - backend/src/services/checkout_service.py
  - next-frontend/src/context/CartContext.tsx
  - next-frontend/src/app/products/[id]/page.tsx
  - next-frontend/src/app/checkout/page.tsx
  - next-frontend/src/app/dashboard/orders/[id]/page.tsx
  - next-frontend/src/app/account/orders/[id]/page.tsx
  - apps/customer-mobile/src/shared/types.ts
  - apps/customer-mobile/src/context/CartContext.tsx
  - apps/customer-mobile/src/screens/ProductDetailScreen.tsx
  - apps/customer-mobile/src/screens/CheckoutScreen.tsx
  - apps/customer-mobile/src/screens/OrdersScreen.tsx
  - apps/seller-mobile/src/shared/types.ts
  - apps/seller-mobile/src/screens/SellerOrdersScreen.tsx
  - apps/admin-mobile/src/shared/types.ts
  - apps/admin-mobile/src/screens/AdminOrdersScreen.tsx
tests:
  - Neon PostgreSQL migration adding variant_name and variant_id to orderitem
  - Soft-delete test products with variants cleanup
  - Live API validation of active products list
  - next-frontend production build
---

## Prompt

order detail page per variant ka name bhi show ho , or mobile app check karlo k proper hay tou sahi hay , or woh jo abhi recently testing k liyay products upload kari thin woh delete kardo

## Response snapshot

1. Added `variant_name` (VARCHAR) and `variant_id` (INTEGER) to Neon PostgreSQL `orderitem` table and SQLModel `OrderItem` / `OrderItemRead`.
2. Updated checkout service to persist `variant_name` and `variant_id` into order items, and calculate order totals using variant unit prices.
3. Updated Next.js web frontend:
   - `CartContext.tsx`: Unique cart keying using `product_id` and `variant_name`.
   - `products/[id]/page.tsx` & `checkout/page.tsx`: Passes `variant_name`, `variant_id`, and `price` to cart and checkout payload.
   - Seller order detail (`/dashboard/orders/[id]`) and customer order detail (`/account/orders/[id]`): Added "Option: {variant_name}" badge and `Rs.` formatting.
4. Mobile Apps:
   - `customer-mobile`: Fixed synthetic ID bug in `ProductDetailScreen`; added `selected_variant` to `CartItem`, passed `variant_name` and `variant_id` during checkout, and displayed item breakdowns with variant names in `OrdersScreen`.
   - `seller-mobile`: Rendered `variant_name` alongside product titles in `SellerOrdersScreen`.
   - `admin-mobile`: Added variant fields to types and rendered variant names in `AdminOrdersScreen`.
5. Cleaned up recent test products (soft-deleted `is_deleted = True` and deleted test variants) so only authentic marketplace items are returned.

## Outcome

- ✅ Impact: Variant names are now tracked in order items and clearly displayed across customer, seller, and admin order screens on web and mobile. Test products are cleaned up from the marketplace.
- 🧪 Tests: Database schema verified, live API verified (clean product list), Next.js frontend built.
- 📁 Files: `backend/src/models/order.py`, `backend/src/api/checkout.py`, `backend/src/services/checkout_service.py`, `next-frontend/src/context/CartContext.tsx`, `next-frontend/src/app/products/[id]/page.tsx`, `next-frontend/src/app/checkout/page.tsx`, `next-frontend/src/app/dashboard/orders/[id]/page.tsx`, `next-frontend/src/app/account/orders/[id]/page.tsx`, `apps/customer-mobile/**`, `apps/seller-mobile/**`, `apps/admin-mobile/**`.
- 🔁 Next prompts: Commit and push changes to GitHub.
