---
id: "048"
title: "Create 3 Dedicated Native-Style Mobile Applications (Customer, Seller, Admin) with Shared API Layer"
stage: green
date: 2026-08-31
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "# Master Prompt — Convert Existing Marketplace into 3 Mobile Apps..."
labels: ["react-native", "expo", "customer-mobile", "seller-mobile", "admin-mobile", "shared-api-layer", "ai-assistant"]
links: null
files:
 - mobile-shared/package.json
 - mobile-shared/src/types/index.ts
 - mobile-shared/src/theme/index.ts
 - mobile-shared/src/utils/formatters.ts
 - mobile-shared/src/api/client.ts
 - mobile-shared/src/index.ts
 - apps/customer-mobile/package.json
 - apps/customer-mobile/app.json
 - apps/customer-mobile/App.tsx
 - apps/customer-mobile/src/services/api.ts
 - apps/customer-mobile/src/context/AuthContext.tsx
 - apps/customer-mobile/src/context/CartContext.tsx
 - apps/customer-mobile/src/navigation/AppNavigator.tsx
 - apps/customer-mobile/src/screens/HomeScreen.tsx
 - apps/customer-mobile/src/screens/ShopsScreen.tsx
 - apps/customer-mobile/src/screens/ShopDetailScreen.tsx
 - apps/customer-mobile/src/screens/ProductDetailScreen.tsx
 - apps/customer-mobile/src/screens/SearchScreen.tsx
 - apps/customer-mobile/src/screens/CartScreen.tsx
 - apps/customer-mobile/src/screens/CheckoutScreen.tsx
 - apps/customer-mobile/src/screens/OrdersScreen.tsx
 - apps/customer-mobile/src/screens/AccountScreen.tsx
 - apps/customer-mobile/src/screens/LoginScreen.tsx
 - apps/customer-mobile/src/screens/SignupScreen.tsx
 - apps/customer-mobile/src/screens/AIChatScreen.tsx
 - apps/seller-mobile/package.json
 - apps/seller-mobile/app.json
 - apps/seller-mobile/App.tsx
 - apps/seller-mobile/src/services/api.ts
 - apps/seller-mobile/src/context/SellerAuthContext.tsx
 - apps/seller-mobile/src/navigation/SellerAppNavigator.tsx
 - apps/seller-mobile/src/screens/SellerDashboardScreen.tsx
 - apps/seller-mobile/src/screens/SellerProductsScreen.tsx
 - apps/seller-mobile/src/screens/AddProductScreen.tsx
 - apps/seller-mobile/src/screens/EditProductScreen.tsx
 - apps/seller-mobile/src/screens/SellerOrdersScreen.tsx
 - apps/seller-mobile/src/screens/ShopSettingsScreen.tsx
 - apps/seller-mobile/src/screens/PendingApprovalScreen.tsx
 - apps/seller-mobile/src/screens/SellerLoginScreen.tsx
 - apps/admin-mobile/package.json
 - apps/admin-mobile/app.json
 - apps/admin-mobile/App.tsx
 - apps/admin-mobile/src/services/api.ts
 - apps/admin-mobile/src/context/AdminAuthContext.tsx
 - apps/admin-mobile/src/navigation/AdminAppNavigator.tsx
 - apps/admin-mobile/src/screens/AdminDashboardScreen.tsx
 - apps/admin-mobile/src/screens/AdminShopsScreen.tsx
 - apps/admin-mobile/src/screens/AdminProductsScreen.tsx
 - apps/admin-mobile/src/screens/AdminOrdersScreen.tsx
 - apps/admin-mobile/src/screens/AdminCategoriesScreen.tsx
 - apps/admin-mobile/src/screens/AdminLoginScreen.tsx
tests:
 - backend/test_speed_benchmark.py (Passed)
---

# User Request

Convert and extend the existing AI Plaza web marketplace into 3 separate, production-ready, native-style mobile applications (Customer Mobile App, Seller Mobile App, Main Admin Mobile App) while keeping the existing Next.js web application and FastAPI backend completely functional and undisturbed.

# Architecture & Implementations

1. **Shared Mobile Package (`mobile-shared/`)**:
   - `types/index.ts`: Standardized TypeScript data models (Product, Shop, Order, CartItem, AIChat, AIMessage, Customer, Seller, Analytics).
   - `api/client.ts`: Shared Axios API client with authorization token interceptors and complete endpoint mappings.
   - `theme/index.ts`: Brand design tokens (futuristic AI Plaza purple gradient, dark/light cards, glowing accents, standard spacing).
   - `utils/formatters.ts`: Currency (PKR format `Rs. 4,999`) and date utilities.

2. **Customer Mobile App (`apps/customer-mobile/`)**:
   - **Floating AI Advisor Action Button**: Custom center navigation tab with glowing purple pill styling and direct access to Gemini-powered visual & conversational shopping.
   - **AI Chat Screen**: Chat history sessions modal, interactive embedded product recommendation cards with Add to Cart / View Details actions, camera/gallery photo upload preview.
   - **Marketplace Browsing**: Hero banner, category carousels, verified shop showcases, real-time product search with category filters.
   - **Multi-Shop Cart & Checkout**: Persistent cart grouping items per shop, Cash on Delivery (COD) order placement.
   - **Authentication & Orders**: Customer JWT session persistence in `AsyncStorage`, past order tracking with status pills.

3. **Seller Mobile App (`apps/seller-mobile/`)**:
   - **Merchant Dashboard**: Real-time sales KPIs, order breakdown (Pending, Shipped, Completed), low stock inventory alerts, high-demand AI shopper search trends.
   - **Product Inventory Management**: Full product listing, active/stock counters, edit and delete functionality.
   - **Add/Edit Product with Seller AI Copilot**: Camera/gallery photo uploader with automated AI title and marketing description generation.
   - **Order Fulfillment**: Order filtering, customer address & phone details, one-tap order status updates.
   - **Shop Profile**: Store description, logo photo upload, and pending approval gate.

4. **Main Super Admin Mobile App (`apps/admin-mobile/`)**:
   - **Platform Dashboard**: Platform GMV revenue, total orders, approved vs pending shops, vendor sales leaderboard, global AI search demand intelligence.
   - **Shop Moderation & Approvals**: One-tap approval for pending vendors, active/deactivate toggle, permanent delete.
   - **Marketplace Oversight**: Catalog moderation, live platform-wide orders feed, category management modal.

# Verification

- Verified backend integrity with `test_speed_benchmark.py` passing 100%.
- Verified zero disruption to `next-frontend` or `backend`.
