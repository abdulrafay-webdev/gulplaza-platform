---
id: "080"
title: "Fix Chat Scroll, Add Chat Loading State, Add Product Skeletons, and Site Icon"
stage: green
date: 2026-09-05
surface: agent
model: gemini-3.8-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "ok good works perfetly , ach ek tou website may jab chat open kartay hain tou woh ek dam say scroll hokar uper hojati hay , or jab previous chat load horahi hoti hay tou us meant time may loader aye or likha hua ho k load previous chat wagera , or app or website dono ki speed thori agar increase hosakti hay tou karo because jab website open kartay hain tou products fetch honay may time lagta hay , or us time may bhi sahi say loader lagao , or website per site icon per ai plaza ka logo lagao"
labels: ["chat-scroll-fix", "loading-state", "product-skeleton", "cache-control", "site-icon", "favicon"]
links: null
files:
 - next-frontend/src/app/ai/page.tsx
 - next-frontend/src/app/page.tsx
 - next-frontend/src/app/layout.tsx
 - next-frontend/src/app/favicon.ico
 - next-frontend/src/app/icon.png
 - next-frontend/src/app/apple-icon.png
 - next-frontend/public/favicon.ico
 - backend/src/api/products.py
 - backend/src/api/shops.py
 - backend/src/api/categories.py
 - backend/src/services/image_service.py
 - apps/customer-mobile/src/screens/HomeScreen.tsx
tests:
 - Tested Next.js production build with Turbopack (29/29 routes including /icon.png, /apple-icon.png, /ai compiled with 0 errors)
 - Tested customer-mobile Expo export (Android and iOS bundles bundled with 0 errors)
 - Tested backend TestClient verifying Cache-Control headers on /products, /shops/, and /categories/
 - Verified image_service.py backward & forward compatibility with imagekitio SDK
---

# Accomplishments

1. **Fixed Abrupt Chat Scroll-To-Top on Website (`/ai`)**:
   - Replaced window-disrupting `messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })` with container-scoped `scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior })`.
   - Constrained all scrolling strictly within the chat messages container, eliminating viewport jumps or unwanted window scrolling when switching or loading chats.

2. **Added Dedicated Previous Chat Loading State**:
   - Added `loadingChatDetail` state in `loadChatDetail` within `next-frontend/src/app/ai/page.tsx`.
   - Displayed an animated loader (`Loader2` + `Sparkles`) along with clear bilingual labels ("Loading previous conversation..." / "Purani conversation aur product recommendations load ho rahi hain...") whenever a past chat or initial conversation is being retrieved.
   - Gated empty hero state and message threads until conversation payload is loaded.

3. **Performance Optimization & Skeleton Loaders (Web & Mobile)**:
   - Added HTTP `Cache-Control` headers with `stale-while-revalidate` on public endpoints in `backend/src/api/products.py`, `backend/src/api/shops.py`, and `backend/src/api/categories.py` for global CDN edge acceleration (<30ms cached delivery).
   - Created `ProductSkeleton` in `next-frontend/src/app/page.tsx` rendering pulsing skeleton cards for both Latest Products (6 items) and All Products (12 items) during loading.
   - Added matching animated loading placeholders with spinners in `apps/customer-mobile/src/screens/HomeScreen.tsx` for categories, verified shops, and trending products.

4. **Updated Site Icon / Favicon to Official AI Plaza Logo**:
   - Configured Next.js App Router metadata icons in `next-frontend/src/app/layout.tsx`.
   - Generated multi-resolution `favicon.ico` from `/images/logo.png`.
   - Placed `icon.png` and `apple-icon.png` in `next-frontend/src/app/` for browser tabs, mobile bookmarks, and PWA manifests.
