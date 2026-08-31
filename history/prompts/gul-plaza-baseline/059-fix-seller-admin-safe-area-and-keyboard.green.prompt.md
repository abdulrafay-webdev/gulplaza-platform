---
id: "059"
title: "Fix Status Bar Insets and Keyboard Avoidance Across Seller and Admin Apps"
stage: green
date: 2026-08-31
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "Fixed top status bar / camera notch overlap across Seller and Admin apps using react-native-safe-area-context edges and resolved keyboard overlapping text input fields"
labels: ["seller-mobile", "admin-mobile", "safe-area-context", "keyboard-avoidance", "notch-fix", "softwareKeyboardLayoutMode"]
links: null
files:
 - apps/seller-mobile/src/screens/SellerDashboardScreen.tsx
 - apps/seller-mobile/src/screens/SellerProductsScreen.tsx
 - apps/seller-mobile/src/screens/AddProductScreen.tsx
 - apps/seller-mobile/src/screens/EditProductScreen.tsx
 - apps/seller-mobile/src/screens/SellerOrdersScreen.tsx
 - apps/seller-mobile/src/screens/ShopSettingsScreen.tsx
 - apps/seller-mobile/src/screens/PendingApprovalScreen.tsx
 - apps/admin-mobile/src/screens/AdminDashboardScreen.tsx
 - apps/admin-mobile/src/screens/AdminShopsScreen.tsx
 - apps/admin-mobile/src/screens/AdminProductsScreen.tsx
 - apps/admin-mobile/src/screens/AdminOrdersScreen.tsx
 - apps/admin-mobile/src/screens/AdminCategoriesScreen.tsx
 - apps/customer-mobile/app.json
 - apps/seller-mobile/app.json
 - apps/admin-mobile/app.json
tests:
 - Seller mobile app Expo bundle export verified (4.56 MB, 2777 modules)
 - Admin mobile app Expo bundle export verified (4.51 MB, 2770 modules)
---

# Accomplishments

1. **Top Status Bar / Clock / Battery Notch Overlap Fix**:
   - Replaced all legacy `react-native` `SafeAreaView` with modern `react-native-safe-area-context` with `edges={['top', 'left', 'right']}` across all screens in `seller-mobile` and `admin-mobile`.
   - Headers, navbars, metrics, and shop titles now render below the system status bar and camera cutouts.
2. **Keyboard Obscuring Input Fields Fix**:
   - Added `KeyboardAvoidingView` (`behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` with vertical offset) and `keyboardShouldPersistTaps="handled"` on `AddProductScreen`, `EditProductScreen`, `ShopSettingsScreen`, and `AdminCategoriesScreen`.
   - Added `"softwareKeyboardLayoutMode": "pan"` in `app.json` across all 3 apps for native Android viewport adjustments when soft keyboard is toggled.
