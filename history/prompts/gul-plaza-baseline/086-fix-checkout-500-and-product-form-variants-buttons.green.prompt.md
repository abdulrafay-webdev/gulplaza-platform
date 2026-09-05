---
id: "086"
title: "Fix Checkout 500 and Product Form Variants Buttons"
stage: "green"
date: "2026-09-05"
surface: "agent"
model: "inherit"
feature: "gul-plaza-baseline"
branch: "1-gul-plaza-baseline"
user: "abdulrafay-webdev"
command: "checkout 500 fix and product form ux"
labels: ["checkout", "variants", "buttons", "bugfix", "ui-ux"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/api/checkout.py
  - backend/src/api/customers.py
  - backend/src/services/checkout_service.py
  - next-frontend/src/app/globals.css
  - next-frontend/src/app/dashboard/products/page.tsx
  - next-frontend/src/app/dashboard/products/new/page.tsx
  - next-frontend/src/app/dashboard/products/[id]/edit/page.tsx
  - next-frontend/src/app/search/page.tsx
  - next-frontend/src/app/account/orders/[id]/page.tsx
  - apps/seller-mobile/src/screens/AddProductScreen.tsx
  - apps/seller-mobile/src/screens/EditProductScreen.tsx
tests:
  - python test checkout with seller token
  - python test checkout with customer token
  - npm.cmd run build in next-frontend
---

## Prompt

Failed to load resource: the server responded with a status of 500 ()

38cf66fa84af7476.js:1 Checkout error: 
code: "ERR_BAD_RESPONSE"
config: {timeout: 20000}
message: "Request failed with status code 500"
name: "AxiosError"
status: 500

Plus:
- jab product add kar rahay hotay hain checkbox per tick karnay k baad base price or last may jo stock ka option hay woh un necessary hay usay hata do
- add product button or publish product button wagera sirf hover karnay per nazar arahay hain , tou ye issue solve karo

## Response snapshot

Fixed checkout 500 error root cause where non-integer customer tokens aborted the PostgreSQL transaction block before order processing. Added token validation and session rollback protection. Updated web and mobile product forms to hide redundant price and stock inputs when variants are enabled, auto-calculating base price (minimum variant price) and total stock from the variants list. Added theme aliases and updated all action buttons (Add Product, Publish Product, Save Product, Buy Now) to high-contrast, prominent solid styling visible without hover.

## Outcome

- ✅ Impact: Cart checkout works reliably without 500 errors; product variant creation UX is clean and friction-free; buttons are always clearly visible.
- 🧪 Tests: Python checkout simulation with seller and customer credentials succeeded; Next.js production build succeeded with zero errors.
- 📁 Files: backend checkout & customer APIs, checkout service, globals.css, dashboard products pages, search page, seller-mobile product screens.
- 🔁 Next prompts: Deploy updates to Vercel and test checkout flow in live production.
- 🧠 Reflection: In PostgreSQL, a DataError inside an uncommitted session aborts all subsequent queries in the same transaction block; always validate input data types before passing them into session.get() or query filters.

## Evaluation notes (flywheel)

- Failure modes observed: InvalidTextRepresentation inside session aborted subsequent SELECT queries in the same session.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Push to GitHub branch 1-gul-plaza-baseline for automated deployment.
