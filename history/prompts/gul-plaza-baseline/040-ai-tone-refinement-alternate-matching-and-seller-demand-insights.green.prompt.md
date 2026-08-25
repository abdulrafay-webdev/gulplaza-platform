---
id: "040"
title: "AI Tone Refinement, Alternate Matching, Restock Promise, and Seller Demand Dashboard"
stage: green
date: 2026-08-25
surface: agent
model: gemini-3.7-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: AI properly work kar raha hay but jab exact match ki product na milay tou woh us ka koi alternate product dikhaye or agar koi alternate bhi nhi hay tou ye bolay k ap kuch din baad dubara check karlijayga may restock karwanay ki koshish karta houn , or woh swagat wagera jaisay word na use karay , or jo products k baray may log zyada puchien usay sellers k dashboard per dikhao taakay sellers woh stock may add kar sakien
labels: ["tone-refinement", "alternate-products", "restock-promise", "demand-tracking", "seller-insights"]
links: null
files:
 - backend/src/models/ai_chat.py
 - backend/src/services/ai_provider.py
 - backend/src/services/ai_shopping_service.py
 - backend/src/api/shops.py
 - backend/src/api/admin.py
 - next-frontend/src/app/dashboard/page.tsx
 - next-frontend/src/app/admin/page.tsx
tests:
 - python backend/test_ai_assistant.py
 - npm.cmd run build
---

# User Request

User requested:
1. If exact product match is not found, AI must recommend suitable alternate products from the catalog.
2. If no matching/alternate product exists, AI must say: *"Filhal marketplace mein yeh product ya is ka alternate available nahi hai. Aap kuch din baad dobara check kar lijiye ga, main restock karwanay ki koshish karta hoon!"*
3. Remove Hindi words like 'swagat', 'namaste' and use natural Pakistani Roman Urdu.
4. Track high-demand shopper queries from the AI assistant and display them on the Seller Dashboard (`/dashboard`) so sellers know what inventory to restock/add.

# Implementation Summary

- **Tone & Logic Refinement ([`ai_provider.py`](file:///D:/gul-plaza/backend/src/services/ai_provider.py)):** Updated system prompt with strict prohibition of Hindi vocabulary and added instructions for exact vs alternate recommendations vs restock promise.
- **Demand Tracking Model ([`ai_chat.py`](file:///D:/gul-plaza/backend/src/models/ai_chat.py)):** Created `AIDemandInsight` model to track query terms, request frequency, category, and match status.
- **RAG Pipeline Update ([`ai_shopping_service.py`](file:///D:/gul-plaza/backend/src/services/ai_shopping_service.py)):** Enhanced `search_candidate_products` with category alternate fallbacks and added `record_customer_demand` on every message.
- **Seller & Admin Analytics ([`shops.py`](file:///D:/gul-plaza/backend/src/api/shops.py), [`admin.py`](file:///D:/gul-plaza/backend/src/api/admin.py)):** Added `trending_ai_demands` list to `/api/v1/shops/me/analytics` and `/api/v1/admin/analytics`.
- **Seller Dashboard UI ([`dashboard/page.tsx`](file:///D:/gul-plaza/next-frontend/src/app/dashboard/page.tsx)):** Added 🔥 **"High Demand Customer Queries (AI Shopping Insights)"** widget with search counts, restock alert badges, and a direct "+ Add Item" link.
- **Admin Dashboard UI ([`admin/page.tsx`](file:///D:/gul-plaza/next-frontend/src/app/admin/page.tsx)):** Added platform-wide AI Market Demand Trends widget.

# Outcome

Verified with automated backend tests and Next.js clean production build (18/18 routes).
