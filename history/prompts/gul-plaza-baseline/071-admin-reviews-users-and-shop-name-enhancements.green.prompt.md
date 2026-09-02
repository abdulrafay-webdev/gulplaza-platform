---
id: "071"
title: "Admin Reviews, Users Directory, and Shop Name Enhancements"
stage: green
date: 2026-09-02
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "mobile app may side bar may jo verified gul plaza shop hain usay AI Plaza shop karo , or admin app may jo products show horahi hain us may uper gul plaza store likha hua hay us ki jaga jis shop ki product hay us shop ka name likha ho , or admin app may orders walay section may shop k agay shop ka name likha ho, or admin app may bhi hamburger add karo jis may review ka section ho jahan show houn saray reviews or un reviews k sath ye bhi show ho k kis shop ka or kis product ka review hay , or admin panel may saaray users bhi show houn us may 2 section houn seller , customer or us may saray user show horahay houn jis bhi user per click karien us ki saari collective detail ajaye phone number address wager or password wagera bhi"
labels: ["admin-mobile", "admin-web", "reviews-moderation", "users-management", "branding-ai-plaza", "shop-names"]
links: null
files:
 - apps/customer-mobile/src/screens/HomeScreen.tsx
 - backend/src/models/product.py
 - backend/src/models/order.py
 - backend/src/services/order_service.py
 - backend/src/api/products.py
 - backend/src/api/admin.py
 - apps/admin-mobile/src/services/api.ts
 - apps/admin-mobile/src/navigation/AdminAppNavigator.tsx
 - apps/admin-mobile/src/screens/AdminProductsScreen.tsx
 - apps/admin-mobile/src/screens/AdminOrdersScreen.tsx
 - apps/admin-mobile/src/screens/AdminDashboardScreen.tsx
 - apps/admin-mobile/src/screens/AdminReviewsScreen.tsx
 - apps/admin-mobile/src/screens/AdminUsersScreen.tsx
 - next-frontend/src/services/api.ts
 - next-frontend/src/app/admin/layout.tsx
 - next-frontend/src/app/admin/reviews/page.tsx
 - next-frontend/src/app/admin/users/page.tsx
tests:
 - Admin mobile Android Expo bundle export passed (4.65 MB bundle, 0 errors)
 - Customer mobile Android Expo bundle export passed (4.66 MB bundle, 0 errors)
 - Next.js production build passed (27/27 pages compiled with 0 errors)
---

# Accomplishments

1. **Customer Mobile Sidebar Rebranding**:
   - Replaced `"Verified Gul Plaza Shops"` with `"AI Plaza Shops"` in `apps/customer-mobile/src/screens/HomeScreen.tsx`.

2. **Accurate Shop Name Display Across Admin Mobile**:
   - Updated `ProductRead` and `OrderRead` schemas to include `shop_name`.
   - Updated backend `list_all_products`, `get_product`, `get_orders`, and `get_all_orders` to eagerly attach `shop_name`.
   - In `apps/admin-mobile/src/screens/AdminProductsScreen.tsx`, loaded shop mappings and replaced `"Gul Plaza Store"` with the real shop name (`item.shop?.name || item.shop_name || shopsMap[item.shop_id]`).
   - In `apps/admin-mobile/src/screens/AdminOrdersScreen.tsx`, displayed the bold store name adjacent to the "Shop" label.

3. **Admin Hamburger Menu & Moderation in Admin Mobile**:
   - Added top-header hamburger menu button and slide-out navigation drawer to `AdminDashboardScreen.tsx`.
   - Built `apps/admin-mobile/src/screens/AdminReviewsScreen.tsx` with full reviews listing showing store name, product name, product thumbnail, star rating, reviewer name/email, and 1-click Approve/Delete actions.
   - Added Quick Access cards on the admin dashboard for Reviews Moderation and Users Directory.

4. **Comprehensive Platform Users Management (Sellers & Customers)**:
   - Added backend `GET /admin/users` returning categorized lists of Sellers and Customers with collective information.
   - Built `apps/admin-mobile/src/screens/AdminUsersScreen.tsx` with Sellers and Customers segments, live search, and a collective profile modal displaying phone, email, physical address/shipping address, orders/products count, registration date, and security credentials (password/hash reveal).

5. **Web Admin Panel Parity**:
   - Added `next-frontend/src/app/admin/reviews/page.tsx` for web reviews governance.
   - Added `next-frontend/src/app/admin/users/page.tsx` for web users directory with collective detail popup.
   - Updated web `AdminLayout` sidebar navigation with Users Directory and Reviews Moderation links.
   - Verified 100% build integrity across all apps (Next.js 27/27 pages, admin mobile Expo bundle, customer mobile Expo bundle).
