---
id: "041"
title: "Remove Demo Reviews and Implement Strict Product Isolation and Seller Review Approvals"
stage: green
date: 2026-08-25
surface: agent
model: gemini-3.7-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: acha ab review ka jo section hay usay sahi karo abhi demo reviews show horahay hain har jaga woh hata do , review jis product per dain sirf usi product per show ho or review approval usi shop per jaye bas
labels: ["reviews", "seller-approvals", "product-isolation", "db-migration"]
links: null
files:
 - backend/src/models/review.py
 - backend/src/api/reviews.py
 - backend/migrate_reviews_table.py
 - backend/test_review_flow.py
 - next-frontend/src/services/api.ts
 - next-frontend/src/app/dashboard/layout.tsx
 - next-frontend/src/app/dashboard/reviews/page.tsx
 - next-frontend/src/app/products/[id]/page.tsx
tests:
 - python backend/test_review_flow.py
 - npm.cmd run build
---

# User Request

User requested:
1. Remove all demo reviews across the platform.
2. Ensure reviews are strictly isolated so a review submitted on Product X only ever appears on Product X.
3. Review approval workflow: when a customer submits a review, it routes strictly to that product's shop dashboard (`/dashboard/reviews`) where the shop owner can approve or delete it before it goes live.

# Implementation Summary

1. **Database Schema & Migration ([`review.py`](file:///D:/gul-plaza/backend/src/models/review.py), [`migrate_reviews_table.py`](file:///D:/gul-plaza/backend/migrate_reviews_table.py)):**
   - Added `shop_id` (foreign key to `Shop`) and `is_approved` (boolean default False) to `Review` model.
   - Cleared all demo reviews from PostgreSQL.
2. **Backend API Endpoints ([`reviews.py`](file:///D:/gul-plaza/backend/src/api/reviews.py)):**
   - `GET /products/{id}/reviews`: Filters `where(Review.product_id == id, Review.is_approved == True)` for strict product isolation.
   - `POST /products/{id}/reviews`: Automatically assigns `shop_id = product.shop_id` and sets `is_approved = False`.
   - `GET /reviews/shop/me`: Seller endpoint returning pending and approved reviews for the authenticated store.
   - `PATCH /reviews/{id}/approve`: Seller 1-click approval endpoint.
   - `DELETE /reviews/{id}`: Seller reject / delete endpoint.
3. **Frontend Seller Portal ([`dashboard/reviews/page.tsx`](file:///D:/gul-plaza/next-frontend/src/app/dashboard/reviews/page.tsx), [`dashboard/layout.tsx`](file:///D:/gul-plaza/next-frontend/src/app/dashboard/layout.tsx)):**
   - Created **"Product Reviews & Store Approvals"** portal with tabs (All, Pending, Live) and 1-click Approve / Delete actions.
   - Added `Product Reviews` to the seller sidebar and mobile navigation.
4. **Product Page ([`products/[id]/page.tsx`](file:///D:/gul-plaza/next-frontend/src/app/products/[id]/page.tsx)):**
   - Updated review submission form to display store approval confirmation feedback.

# Outcome

Verified with full lifecycle test suite (`test_review_flow.py`) and clean Next.js build (19/19 routes).
