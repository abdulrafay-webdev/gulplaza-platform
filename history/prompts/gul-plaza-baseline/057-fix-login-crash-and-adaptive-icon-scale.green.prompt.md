---
id: "057"
title: "Fix Login Screen Crash and Apply Adaptive Icon Safe-Zone Padding"
stage: green
date: 2026-08-31
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "Fixed runtime crash when navigating to LoginScreen and SignupScreen by importing Image from react-native, and added safe-zone padding to Android adaptive-icon.png so the logo fits completely inside launcher circle/squircle masks without cropping"
labels: ["crash-fix", "login-screen", "signup-screen", "adaptive-icon", "android-mask-fix", "customer-mobile"]
links: null
files:
 - apps/customer-mobile/src/screens/LoginScreen.tsx
 - apps/customer-mobile/src/screens/SignupScreen.tsx
 - apps/customer-mobile/assets/adaptive-icon.png
 - apps/customer-mobile/assets/icon.png
 - apps/customer-mobile/assets/splash-icon.png
 - apps/seller-mobile/assets/adaptive-icon.png
 - apps/seller-mobile/assets/icon.png
 - apps/seller-mobile/assets/splash-icon.png
 - apps/admin-mobile/assets/adaptive-icon.png
 - apps/admin-mobile/assets/icon.png
 - apps/admin-mobile/assets/splash-icon.png
tests:
 - Customer mobile app Expo bundle export verified (4.60 MB, 2781 modules)
---

# Accomplishments

1. **Sign In Navigation Crash Resolved**:
   - Identified that `LoginScreen.tsx` and `SignupScreen.tsx` were referencing `<Image ... />` for the logo without importing `Image` from `react-native`.
   - Imported `Image` from `react-native`, resolving the runtime `ReferenceError: Property 'Image' doesn't exist` that caused the app to instantly close upon opening Sign In.
2. **Android Adaptive Icon Safe-Zone Scaling**:
   - Rebuilt `adaptive-icon.png` across all 3 mobile apps (`customer-mobile`, `seller-mobile`, `admin-mobile`) with 58% scaling centered on a 1024x1024 canvas.
   - Adheres to Android Adaptive Icon guidelines so 100% of the logo remains completely visible without being cut off by circle, rounded rectangle, or squircle masks on Android home screens.
