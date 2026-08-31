---
id: "054"
title: "Apply Custom Logo Across Web Platform and Mobile Apps"
stage: green
date: 2026-08-31
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "Applied the user-provided logo.png across all places: Web Navbar, Footer, Customer/Seller/Admin login and register pages, Dashboards, Mobile App splash screens, and App Icons"
labels: ["branding", "logo", "mobile-icon", "splash-screen", "nextjs", "expo"]
links: null
files:
 - next-frontend/public/images/logo.png
 - next-frontend/src/components/PublicLayout.tsx
 - next-frontend/src/app/login/page.tsx
 - next-frontend/src/app/signup/page.tsx
 - next-frontend/src/app/seller/login/page.tsx
 - next-frontend/src/app/seller/register/page.tsx
 - next-frontend/src/app/admin/login/page.tsx
 - next-frontend/src/app/dashboard/layout.tsx
 - next-frontend/src/app/admin/layout.tsx
 - apps/customer-mobile/app.json
 - apps/customer-mobile/assets/logo.png
 - apps/customer-mobile/assets/icon.png
 - apps/customer-mobile/assets/adaptive-icon.png
 - apps/customer-mobile/assets/splash-icon.png
 - apps/customer-mobile/src/screens/HomeScreen.tsx
 - apps/customer-mobile/src/screens/LoginScreen.tsx
 - apps/customer-mobile/src/screens/SignupScreen.tsx
 - apps/seller-mobile/app.json
 - apps/seller-mobile/assets/logo.png
 - apps/seller-mobile/src/screens/SellerLoginScreen.tsx
 - apps/admin-mobile/app.json
 - apps/admin-mobile/assets/logo.png
 - apps/admin-mobile/src/screens/AdminLoginScreen.tsx
tests:
 - Next.js production build verified (22/22 routes)
 - Customer mobile app Expo bundle verified (4.60 MB, 2781 modules)
 - Seller mobile app Expo bundle verified (4.56 MB, 2777 modules)
 - Admin mobile app Expo bundle verified (4.51 MB, 2770 modules)
---

# Accomplishments

1. **Website Branding**:
   - Replaced generic bot icon with `logo.png` in the main sticky Navbar, Footer copyright, and mobile top bar.
   - Integrated custom logo into Customer Login, Signup, Seller Login, Seller Store Registration, and Super Admin Login pages.
   - Added logo to Seller Vendor Portal and Super Admin Sidebar Navigation.
2. **Mobile Apps App Icon & Splash Screen**:
   - Configured `icon.png`, `adaptive-icon.png`, and `splash-icon.png` in `app.json` for Customer, Seller, and Admin apps.
   - Displayed logo in mobile top header of Customer `HomeScreen`, `LoginScreen`, `SignupScreen`, `SellerLoginScreen`, and `AdminLoginScreen`.
