---
id: "061"
title: "Wire Real Database Orders and Analytics Across Seller and Admin Apps"
stage: green
date: 2026-08-31
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "Fixed orders and analytics API endpoints on backend to return real database orders for SELLER and SUPER_ADMIN roles, added items breakdown and pull-to-refresh on Seller and Admin Orders screens"
labels: ["seller-orders", "admin-orders", "live-analytics", "order-items-breakdown", "real-time-data"]
links: null
files:
 - backend/src/api/orders.py
 - backend/src/api/shops.py
 - backend/src/services/order_service.py
 - backend/src/services/shop_service.py
 - apps/seller-mobile/src/screens/SellerOrdersScreen.tsx
 - apps/admin-mobile/src/screens/AdminOrdersScreen.tsx
tests:
 - Seller mobile app Expo bundle export verified (4.56 MB, 2777 modules)
 - Admin mobile app Expo bundle export verified (4.52 MB, 2770 modules)
---

# Accomplishments

1. **Real-time Order Fetching for Sellers & Admins**:
   - Resolved backend role matching in `orders.py` where `user["role"] == "SELLER"` or `SUPER_ADMIN` were previously missing shop order lookups.
   - When orders are placed on the platform, `/api/v1/orders` now queries the real database by `Order.shop_id` for sellers and returns all platform orders for super admins.
2. **Real Analytics & KPIs**:
   - Fixed `/api/v1/shops/me/analytics` to reliably resolve seller's shop via `shop_id` and database lookups, computing real total sales, orders by status, and low stock items directly from PostgreSQL tables.
3. **Enhanced Mobile Order Views**:
   - Added ordered item breakdown (product name, quantity, item prices) on each order card in `SellerOrdersScreen` and `AdminOrdersScreen`.
   - Added pull-to-refresh (`RefreshControl`) for instant live order updates.
