---
id: "050"
title: "Verify Lightweight Clerk REST Auth, Production APK URLs, and Website Downloads"
stage: green
date: 2026-08-31
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "Replaced broken Clerk SDK with REST client, added LAN/Production EXPO_PUBLIC_API_URL, verified Android bundles, and added mobile APK download section to website footer"
labels: ["clerk", "expo", "production-build", "apk-downloads", "next-frontend"]
links: null
files:
 - apps/seller-mobile/src/lib/clerk-client.ts
 - apps/seller-mobile/src/lib/ClerkAuthContext.tsx
 - apps/admin-mobile/src/lib/clerk-client.ts
 - apps/admin-mobile/src/lib/ClerkAuthContext.tsx
 - apps/seller-mobile/src/services/api.ts
 - apps/admin-mobile/src/services/api.ts
 - next-frontend/src/components/PublicLayout.tsx
tests:
 - Next.js production build verified (19/19 routes passed)
 - Android bundles verified (Customer: 4.59 MB, Seller: 4.57 MB, Admin: 4.53 MB)
---

# Accomplishments & Verification

1. **Lightweight Clerk REST Client**:
   - Replaced problematic `@clerk/clerk-expo` / `react-dom` dependencies with lightweight REST client in `src/lib/clerk-client.ts` directly interacting with Clerk FAPI.
   - Built custom `ClerkAuthContext` offering standard hooks (`useSignIn`, `useAuth`, `useSignOut`).

2. **Dynamic Base URL Resolution**:
   - Integrated `process.env.EXPO_PUBLIC_API_URL` checks for local LAN IP testing and production domain routing.

3. **Marketplace Web Integration**:
   - Added APK download section in `PublicLayout.tsx` footer with styled download buttons for Customer, Seller, and Admin APKs.
   - Verified Next.js production build (`19/19` routes passing).

4. **Android Bundling Success**:
   - Customer: 4.59 MB bundle (2,780 modules)
   - Seller: 4.57 MB bundle (2,780 modules)
   - Admin: 4.53 MB bundle (2,774 modules)
