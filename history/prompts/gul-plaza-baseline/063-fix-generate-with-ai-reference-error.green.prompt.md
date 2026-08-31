---
id: "063"
title: "Fix ReferenceError generateWithAI in Seller Mobile AddProductScreen"
stage: green
date: 2026-08-31
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "Fixed ReferenceError: Property 'generateWithAI' doesn't exist by correcting event handler name in AddProductScreen, correctly passing shopId to products.create, and adding /ai/generate-description backend endpoint"
labels: ["seller-mobile", "add-product-screen", "reference-error-fix", "ai-product-copilot"]
links: null
files:
 - apps/seller-mobile/src/screens/AddProductScreen.tsx
 - apps/seller-mobile/src/services/api.ts
 - apps/admin-mobile/src/services/api.ts
 - backend/src/api/ai_chat.py
tests:
 - Seller mobile app Expo bundle export verified (4.56 MB, 2777 modules)
---

# Accomplishments

1. **Fixed `ReferenceError: Property 'generateWithAI' doesn't exist`**:
   - Corrected line 269 in `AddProductScreen.tsx` where `onPress={generateWithAI}` was called instead of the defined `handleGenerateAI` function.
2. **Corrected Product Publishing API Call**:
   - Fixed `api.products.create(targetShopId, payload)` to pass the active vendor `shop.id`.
3. **AI Description Generation Endpoint**:
   - Added `POST /api/v1/ai/generate-description` in `ai_chat.py` with ecommerce copywriting generation powered by Gemini AI and graceful fallbacks.
