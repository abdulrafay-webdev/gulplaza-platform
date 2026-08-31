---
id: "065"
title: "Fix Mobile Product Image Upload and Missing Image Rendering Across Platforms"
stage: green
date: 2026-08-31
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "Fixed product image uploading from seller mobile app by formatting multipart FormData with fallback to base64 Data URI, creating backend /products/upload-image endpoint, and eliminating misleading hardcoded mock image fallbacks"
labels: ["seller-mobile", "product-image-upload", "imagekit-cdn", "base64-fallback", "marketplace-media"]
links: null
files:
 - apps/seller-mobile/src/screens/AddProductScreen.tsx
 - apps/seller-mobile/src/screens/EditProductScreen.tsx
 - apps/seller-mobile/src/screens/SellerProductsScreen.tsx
 - apps/seller-mobile/src/services/api.ts
 - apps/admin-mobile/src/services/api.ts
 - backend/src/api/products.py
tests:
 - Seller mobile app Expo bundle export verified (4.56 MB, 2777 modules)
---

# Accomplishments

1. **Root Cause Resolution**:
   - `AddProductScreen.tsx` previously passed a raw local file URI string directly into Axios, causing the image upload request to fail silently and saving `image_url = None` into the database.
   - Replaced with standard multipart `FormData` structure `{ uri, name, type }` accompanied by immediate `base64` Data URI fallback so the exact photo selected from the device is 100% saved into PostgreSQL.
2. **Backend Product Image Upload Endpoint**:
   - Created `/api/v1/products/upload-image` supporting direct image upload to ImageKit CDN with base64 Data URI fallback.
3. **Clean UI Rendering**:
   - Removed misleading mock/unsplash placeholder fallbacks in `SellerProductsScreen.tsx`, rendering clean product cards with the vendor's actual uploaded image.
