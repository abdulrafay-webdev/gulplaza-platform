---
id: "031"
title: "Rebrand to AI Plaza and Seed Demo Multi-Category Stores"
stage: green
date: 2026-08-21
surface: agent
model: gemini-3.7-flash
feature: gul-plaza-baseline
branch: main
user: Yousuf Traders
command: acha ab is ka name AI Plaza kardo , or kuch demo shops registered kar k demo products list kardo alag alag categories ki like home appliances , gadget , clothes shoes etc
labels: ["rebrand", "ai-plaza", "demo-data", "seed-script", "multi-category"]
links: null
files:
 - backend/src/main.py
 - backend/seed_demo_data.py
 - next-frontend/src/app/layout.tsx
 - next-frontend/src/components/PublicLayout.tsx
 - next-frontend/src/app/page.tsx
 - next-frontend/src/app/shops/page.tsx
 - next-frontend/src/app/shops/[id]/page.tsx
 - next-frontend/src/app/products/[id]/page.tsx
 - next-frontend/src/app/checkout/page.tsx
 - next-frontend/src/app/admin/layout.tsx
 - next-frontend/src/app/dashboard/layout.tsx
tests:
 - python backend/seed_demo_data.py
 - npm.cmd run build
---

# User Request

"acha ab is ka name AI Plaza kardo , or kuch demo shops registered kar k demo products list kardo alag alag categories ki like home appliances , gadget , clothes shoes etc"

# Implementation Summary

1. **Rebranding to "AI Plaza":**
   - Updated metadata, logo branding, header, footer, mobile navigation, and layout templates across backend and frontend to "AI Plaza".
2. **Database Seeding (`seed_demo_data.py`):**
   - Created and registered 6 diverse approved stores:
     - Apex Home Appliances (Air Fryers, Robotic Vacuums, Electric Kettles)
     - Nova Tech Gadgets (AMOLED Smartwatches, ANC Wireless Earbuds, 65W GaN Chargers)
     - Zuri Clothing & Couture (Luxury 3-Piece Lawn, Linen Kurta Shalwar)
     - Urban Sole & Footwear (Air Cushion Running Sneakers, Handcrafted Oxford Shoes)
     - Royal Fragrance & Beauty (Oud Royale Extrait de Parfum)
     - Classic Crockery & Cookware (12-Piece Non-Stick Granite Cookware Set)
   - Created 6 top-level categories and linked subcategories, multiple high-res product photos, realistic PKR prices, and stock counts.
3. **Frontend Integration:**
   - Updated homepage categories and hero spotlight for AI Plaza.

# Outcome

The entire platform is now branded as **AI Plaza** and populated with high-quality multi-category stores and inventory.
