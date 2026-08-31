---
id: "053"
title: "Fix Status Bar Notch Insets and Keyboard Avoidance Across Mobile Apps"
stage: green
date: 2026-08-31
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "Fixed top status bar / camera notch content overlap using react-native-safe-area-context edges and resolved keyboard overlapping text input fields across Customer, Seller, and Admin mobile apps"
labels: ["mobile-ui", "safe-area-context", "keyboard-avoiding-view", "notch-fix", "customer-mobile", "seller-mobile", "admin-mobile"]
links: null
files:
 - apps/customer-mobile/src/screens/HomeScreen.tsx
 - apps/customer-mobile/src/screens/SearchScreen.tsx
 - apps/customer-mobile/src/screens/AIChatScreen.tsx
 - apps/customer-mobile/src/screens/CheckoutScreen.tsx
 - apps/customer-mobile/src/screens/LoginScreen.tsx
 - apps/customer-mobile/src/screens/SignupScreen.tsx
 - apps/customer-mobile/src/screens/ProductDetailScreen.tsx
 - apps/customer-mobile/src/screens/ShopDetailScreen.tsx
 - apps/customer-mobile/src/screens/ShopsScreen.tsx
 - apps/customer-mobile/src/screens/CartScreen.tsx
 - apps/customer-mobile/src/screens/AccountScreen.tsx
 - apps/customer-mobile/src/screens/OrdersScreen.tsx
 - apps/seller-mobile/src/screens/SellerLoginScreen.tsx
 - apps/seller-mobile/src/screens/SellerRegisterScreen.tsx
 - apps/admin-mobile/src/screens/AdminLoginScreen.tsx
tests:
 - Customer mobile app Expo bundle build passed (4.60 MB, 2780 modules)
---

# Accomplishments

1. **Top Status Bar / Camera Notch Overlap Fix**:
   - Replaced all legacy `react-native` `SafeAreaView` with modern `react-native-safe-area-context` `SafeAreaView` with `edges={['top', 'left', 'right']}`.
   - Headers, logo bars, back buttons, and titles now render cleanly below the mobile status bar (clock, battery, Wi-Fi icons, and camera cutout).
2. **Keyboard Overlapping Text Input Fix**:
   - Wrapped input screens (`AIChatScreen`, `SearchScreen`, `CheckoutScreen`, `LoginScreen`, `SignupScreen`, `SellerRegisterScreen`, `SellerLoginScreen`, `AdminLoginScreen`) with `KeyboardAvoidingView` (`behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`) and `keyboardVerticalOffset`.
   - Added `keyboardShouldPersistTaps="handled"` on parent `ScrollView`s so tapping and typing smoothly lifts the input above the on-screen keyboard.
