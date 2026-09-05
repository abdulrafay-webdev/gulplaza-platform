---
id: "081"
title: "Update Seller and Admin Mobile App Icons from Images Folder"
stage: green
date: 2026-09-05
surface: agent
model: gemini-3.8-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "image k folder may seller icon name say image hay usay seller app k icon per use karo or jo admin icon k name say image hay usay admin app k icon per use karo"
labels: ["mobile-icons", "seller-mobile", "admin-mobile", "adaptive-icon", "splash-icon", "expo"]
links: null
files:
 - apps/seller-mobile/assets/icon.png
 - apps/seller-mobile/assets/adaptive-icon.png
 - apps/seller-mobile/assets/splash-icon.png
 - apps/seller-mobile/app.json
 - apps/admin-mobile/assets/icon.png
 - apps/admin-mobile/assets/adaptive-icon.png
 - apps/admin-mobile/assets/splash-icon.png
 - apps/admin-mobile/app.json
tests:
 - Tested seller-mobile Expo export (iOS & Android bundles built with 0 errors)
 - Tested admin-mobile Expo export (iOS & Android bundles built with 0 errors)
 - Verified 72% Android Adaptive Icon safe-zone scaling to prevent launcher icon cropping
 - Verified dark theme background alignment (#000000) for adaptive icons and splash screens
---

# Accomplishments

1. **Seller Mobile App Icon Update (`apps/seller-mobile`)**:
   - Used `next-frontend/public/images/seller icon.png` to generate:
     - `assets/icon.png`: High-resolution 1024x1024 standard app icon.
     - `assets/adaptive-icon.png`: 72% safe-zone scaled icon centered on 1024x1024 canvas to prevent Android launcher clipping on circle and squircle masks.
     - `assets/splash-icon.png`: Centered splash screen icon.
   - Updated `apps/seller-mobile/app.json` setting `adaptiveIcon.backgroundColor` and `splash.backgroundColor` to `#000000` to match the icon's theme.

2. **Admin Mobile App Icon Update (`apps/admin-mobile`)**:
   - Used `next-frontend/public/images/admin icon.png` to generate:
     - `assets/icon.png`: High-resolution 1024x1024 standard app icon.
     - `assets/adaptive-icon.png`: 72% safe-zone scaled icon centered on 1024x1024 canvas.
     - `assets/splash-icon.png`: Centered splash screen icon.
   - Updated `apps/admin-mobile/app.json` setting `adaptiveIcon.backgroundColor` and `splash.backgroundColor` to `#000000`.

3. **Build & Export Verification**:
   - Bundled both `apps/seller-mobile` and `apps/admin-mobile` via `npx expo export`, verifying all Android and iOS Hermes bundles and asset pipelines build cleanly with 0 errors.
