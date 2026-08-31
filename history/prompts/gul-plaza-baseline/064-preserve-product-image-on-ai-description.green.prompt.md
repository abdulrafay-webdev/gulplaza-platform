---
id: "064"
title: "Ensure Generative AI Produces Text Descriptions Only Without Altering Product Photos"
stage: green
date: 2026-08-31
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "Configured Generative AI product assistant across Seller Mobile and Web dashboard to auto-populate high-converting title suggestions and descriptions without altering or replacing the seller's original uploaded image"
labels: ["generative-ai", "product-description", "image-preservation", "seller-copilot"]
links: null
files:
 - apps/seller-mobile/src/screens/AddProductScreen.tsx
 - next-frontend/src/app/dashboard/products/new/page.tsx
 - next-frontend/src/services/api.ts
 - backend/src/api/ai_chat.py
tests:
 - Next.js production build verified (22/22 pages, 0 errors)
 - Seller mobile Expo bundle verified (4.56 MB)
---

# Accomplishments

1. **Original Image Preservation**:
   - Ensured that when sellers click **"Generate with AI"** in Seller Mobile App or Web Dashboard, the AI solely drafts `short_description` and `long_description` based on the product title and category.
   - The vendor's original captured or selected product image (`selectedImage`, `image_url`, gallery) is strictly preserved and published to the live marketplace exactly as uploaded.
