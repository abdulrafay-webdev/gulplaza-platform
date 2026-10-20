---
id: "096"
title: "Wholesale Seller Account and Wholesale Marketplace Analysis and Architecture Plan"
stage: "spec"
date: "2026-10-20"
surface: "agent"
model: "inherit"
feature: "gul-plaza-baseline"
branch: "1-gul-plaza-baseline"
user: "abdulrafay-webdev"
command: "Add new feature: WHOLESALE SELLER ACCOUNT + WHOLESALE MARKETPLACE"
labels: ["wholesale", "b2b", "architecture", "multi-vendor", "authorization", "db-migration"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
  conversation: "conversation://8de147ad-2ed8-4ec5-9fcc-91f6fe87cbc7"
files:
  - backend/src/models/shop.py
  - backend/src/models/user.py
  - backend/src/models/product.py
  - backend/src/models/order.py
  - backend/src/api/auth.py
  - backend/src/api/products.py
  - backend/src/api/admin.py
  - backend/src/api/checkout.py
  - backend/src/api/orders.py
  - backend/src/services/ai_shopping_service.py
  - next-frontend/src/app/seller/register/page.tsx
  - next-frontend/src/app/admin/shops/page.tsx
  - next-frontend/src/app/dashboard/layout.tsx
tests:
  - Codebase analysis across Seller, Product, Auth, Cart, Orders, Admin, AI search, and Mobile
  - Architectural Plan created in brain artifact
---

## Prompt

Add new feature: WHOLESALE SELLER ACCOUNT + WHOLESALE MARKETPLACE into the existing AI Plaza project.
Analyze current codebase (Seller model, signup, admin approval, Product, Cart, Orders, Auth, AI search, Mobile) and provide the real architecture plan before implementing.

## Response snapshot

Conducted thorough inspection of the real AI Plaza architecture across backend FastAPI models, authentication, checkout pipelines, AI catalog hydration, frontend Next.js 16 pages, and React Native mobile apps. Documented existing mechanics and delivered a comprehensive, minimal-diff implementation plan adding `seller_type`, `product_type`, and `order_type` with strict backend-level authorization, public catalog isolation, B2B wholesale marketplace, and full backward compatibility.

## Outcome

- Architectural plan created and presented.
- Identified exact models, services, routers, and frontend pages.
- Suggested ADR for Wholesale Marketplace Architecture.
