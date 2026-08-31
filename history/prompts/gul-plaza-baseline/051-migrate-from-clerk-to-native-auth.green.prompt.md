---
id: "051"
title: "Migrate from Clerk to Native Multi-Tenant Authentication Across Web, Mobile, and Backend"
stage: green
date: 2026-08-31
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "Removed Clerk from website, mobile apps, and backend. Implemented native Seller registration with Super Admin approval, seeded existing shops with native passwords, and created Super Admin account abdullrrafay@gmail.com"
labels: ["native-auth", "remove-clerk", "seller-registration", "super-admin", "approval-workflow"]
links: null
files:
 - backend/src/models/user.py
 - backend/src/auth/deps.py
 - backend/src/api/auth.py
 - backend/src/main.py
 - backend/migrate_native_auth.py
 - backend/test_native_auth.py
 - next-frontend/src/context/SellerContext.tsx
 - next-frontend/src/components/Providers.tsx
 - next-frontend/src/components/PublicLayout.tsx
 - next-frontend/src/app/seller/login/page.tsx
 - next-frontend/src/app/seller/register/page.tsx
 - next-frontend/src/app/admin/login/page.tsx
 - next-frontend/src/app/admin/layout.tsx
 - next-frontend/src/app/dashboard/layout.tsx
 - apps/seller-mobile/src/context/SellerAuthContext.tsx
 - apps/seller-mobile/src/screens/SellerLoginScreen.tsx
 - apps/seller-mobile/src/screens/SellerRegisterScreen.tsx
 - apps/seller-mobile/src/navigation/SellerAppNavigator.tsx
 - apps/admin-mobile/src/context/AdminAuthContext.tsx
 - apps/admin-mobile/src/screens/AdminLoginScreen.tsx
tests:
 - Backend test_native_auth.py passed 100% (Admin login, Protected analytics, Seller login, New seller registration with is_approved=False, Admin approval, Approved seller login)
 - Next.js production build passed (22/22 routes)
 - Mobile apps Expo export passed (Customer: 4.59 MB, Seller: 4.56 MB, Admin: 4.51 MB)
---

# Accomplishments

1. **Complete Clerk Removal**:
   - Eliminated `@clerk/nextjs` from web application and removed Clerk clients from mobile apps and backend auth dependencies.
2. **Native Seller Registration & Super Admin Approval**:
   - Added `POST /api/v1/auth/seller/register` with `is_approved=False` default status.
   - Built modern registration screens on both website (`/seller/register`) and Seller Mobile App (`SellerRegisterScreen.tsx`).
   - Stores remain in Pending Approval mode until approved by Super Admin.
3. **Super Admin Account**:
   - Super Admin credentials configured in database:
     - Email: `abdullrrafay@gmail.com`
     - Password: `Rafay@2005`
     - Role: `SUPER_ADMIN`
   - Dedicated login portals on web (`/admin/login`) and Admin Mobile App (`AdminLoginScreen.tsx`).
4. **Existing Registered Shops Migration**:
   - Migrated all existing shops in PostgreSQL database to native `User` credentials with email `{slug}@aiplaza.com` and password `Shop@1234`.
5. **Full Platform Build Verification**:
   - Next.js Web: `22/22` static and dynamic routes compiled cleanly.
   - All 3 Expo mobile apps exported and bundled with 0 errors.
