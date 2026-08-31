---
id: "056"
title: "Configure Production Vercel Backend URL for Mobile Apps"
stage: green
date: 2026-08-31
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "Configured live Vercel backend endpoint https://gulplaza-platform.vercel.app/api/v1 into .env and eas.json for customer-mobile, seller-mobile, and admin-mobile apps"
labels: ["vercel", "production-backend", "eas-build", "env-config", "mobile-apps"]
links: null
files:
 - apps/customer-mobile/.env
 - apps/customer-mobile/eas.json
 - apps/seller-mobile/.env
 - apps/seller-mobile/eas.json
 - apps/admin-mobile/.env
 - apps/admin-mobile/eas.json
tests:
 - Verified live endpoint https://gulplaza-platform.vercel.app/api/v1/products returns 200 OK with product catalog
---

# Accomplishments

1. **Live Backend Verification**:
   - Verified that `https://gulplaza-platform.vercel.app/api/v1` is live, serving Swagger docs, and returning catalog data with 200 OK.
2. **Mobile Environment & EAS Cloud Build Configuration**:
   - Updated `EXPO_PUBLIC_API_URL` to `https://gulplaza-platform.vercel.app/api/v1` across all 3 mobile apps (`customer-mobile`, `seller-mobile`, `admin-mobile`).
   - Embedded the live URL in `eas.json` under `preview`, `development`, and `production` profiles.
   - APKs generated via `eas build --platform android --profile preview` will work globally on any device connected to the internet.
