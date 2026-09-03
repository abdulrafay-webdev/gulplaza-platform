---
id: "077"
title: "Remove Clerk Middleware Redirect from Seller Dashboard"
stage: green
date: 2026-09-03
surface: agent
model: gemini-3.8-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "acha sab perfectly work kar raha hay bas seller ko jab website may login kar rahay hain tou woh email or password puchnay k baad clerk per redirect kar raha hay bas isay set kardo or kuch mat change nhi karna"
labels: ["seller-login", "middleware", "clerk-removal", "bug-fix"]
links: null
files:
 - next-frontend/middleware.ts
tests:
 - Next.js production build verified (27/27 static & dynamic pages compiled with 0 errors)
---

# Accomplishments

1. **Fixed Seller Login Redirection to Clerk**:
   - Identified that `next-frontend/middleware.ts` was using `clerkMiddleware` with `isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])` and calling `await auth.protect()`.
   - Because the platform uses its own custom backend JWT authentication (`SellerContext` storing `aiplaza_seller_token`), redirecting to `/dashboard` after email/password authentication triggered Clerk's middleware which saw no active Clerk session cookie and redirected users to the external Clerk hosted sign-in page.
   - Updated `next-frontend/middleware.ts` to standard Next.js middleware passing through requests, allowing `DashboardLayout`'s native `useSeller()` auth guard to handle access seamlessly.
   - Preserved all other application code and verified clean Next.js build.
