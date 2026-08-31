---
id: "049"
title: "Fix Expo SDK 54 Upgrades and Metro Bundler SVG Resolution"
stage: refactor
date: 2026-08-31
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "Fix mobile bundling errors (Expo SDK 54 compatibility, local shared imports, and react-native-svg resolution)"
labels: ["expo", "react-native-svg", "metro-bundler", "sdk-54", "bug-fix"]
links: null
files:
 - apps/customer-mobile/package.json
 - apps/seller-mobile/package.json
 - apps/admin-mobile/package.json
 - apps/customer-mobile/metro.config.js
 - apps/seller-mobile/metro.config.js
 - apps/admin-mobile/metro.config.js
 - apps/customer-mobile/src/shared/
 - apps/seller-mobile/src/shared/
 - apps/admin-mobile/src/shared/
tests:
 - Metro Bundler resolution verified
---

# Problem & Resolution

1. **Expo Go SDK 54 Version Incompatibility**:
   - User encountered version mismatch prompt on physical device running latest Expo Go SDK 54.
   - Upgraded all 3 apps (`customer-mobile`, `seller-mobile`, `admin-mobile`) to Expo SDK 54, React Native 0.81, and React 19.

2. **External Folder Import Error**:
   - Metro bundler rejected imports pointing outside the application root directory (`../../../../mobile-shared`).
   - Co-located `src/shared/` inside each app folder (`types.ts`, `theme.ts`, `formatters.ts`, `index.ts`), fixing all relative paths.

3. **`react-native-svg` Raw TypeScript Resolution Error**:
   - `react-native-svg` package.json's `"react-native": "src/index.ts"` caused Metro to attempt parsing uncompiled internal `.ts` source files (`extractBrush.ts` -> `convertPercentageColor`).
   - Configured `metro.config.js` with custom `resolver.resolveRequest` and patched `package.json` to resolve the pre-compiled module (`lib/module/index.js`).
