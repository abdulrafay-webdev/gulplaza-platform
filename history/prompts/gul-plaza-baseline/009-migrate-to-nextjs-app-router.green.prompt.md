---
id: 009
title: migrate-to-nextjs-app-router
stage: green
date: 2026-01-24
surface: agent
model: gemini-2.0-flash-exp
feature: gul-plaza-baseline
branch: main
user: Yousuf Traders
command: migrate to nextjs
labels: ["nextjs", "migration", "app-router", "clerk"]
links:
  spec: specs/1-gul-plaza-baseline/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - next-frontend/src/app/layout.tsx
 - next-frontend/src/app/page.tsx
 - next-frontend/src/app/shops/[id]/page.tsx
 - next-frontend/src/app/checkout/page.tsx
 - next-frontend/src/app/dashboard/layout.tsx
 - next-frontend/src/app/dashboard/page.tsx
 - next-frontend/src/app/dashboard/products/page.tsx
 - next-frontend/src/app/dashboard/products/new/page.tsx
 - next-frontend/src/app/dashboard/orders/page.tsx
 - next-frontend/src/app/dashboard/orders/[id]/page.tsx
 - next-frontend/src/services/api.ts
 - next-frontend/src/context/CartContext.tsx
 - next-frontend/middleware.ts
 - backend/src/services/order_service.py
tests:
 - npm run build (Success)
---

## Prompt

Migrate Vite + React project to Next.js (App Router).

## Response snapshot

1.  **Configuration**: Set up `.env.local` and updated `api.ts` to use Next.js environment variables.
2.  **Auth**: Implemented `middleware.ts` with Clerk's `clerkMiddleware` to protect `/dashboard(.*)`.
3.  **Global State**: Migrated `CartContext` to a Client Component with `localStorage` persistence.
4.  **Layouts**: Created `PublicLayout` and `DashboardLayout` as Client Components to maintain existing logic.
5.  **Routes**: 
    - Public: Home (`/`), Shop Detail (`/shops/[id]`), Checkout (`/checkout`).
    - Protected: Dashboard (`/dashboard`), Products (`/dashboard/products`), Orders (`/dashboard/orders`).
6.  **Backend Fix**: Updated `order_service.py` to use `selectinload(Order.items)` ensuring order items are returned in the API.
7.  **Verification**: Successfully ran `npm run build` in `next-frontend`.

## Outcome

- ✅ Impact: Project migrated to Next.js with App Router.
- 🧪 Tests: Production build passed.
- 📁 Files: All major frontend routes and core services migrated.
- 🔁 Next prompts: Ask user to verify UI/Behavior in development.
- 🧠 Reflection: Next.js 16/React 19 required the `use(params)` pattern for dynamic routes.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
