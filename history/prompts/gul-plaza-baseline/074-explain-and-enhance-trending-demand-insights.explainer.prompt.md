---
id: "074"
title: "Explain and Enhance Seller Trending Demand Insights"
stage: explainer
date: 2026-09-02
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "acha ye jo seller may jo trending product ki detail arahi hay kya sahi hay ? functionality set hay ? jab koi product kitni baar search hogi tou wahan show hogi ?"
labels: ["seller-dashboard", "trending-demands", "ai-shopping-assistant", "search-tracking"]
links: null
files:
 - apps/seller-mobile/src/screens/SellerDashboardScreen.tsx
 - backend/src/api/search.py
 - backend/src/services/ai_shopping_service.py
 - backend/src/api/shops.py
tests:
 - Tested search query tracking in Python venv with 0 errors
---

# Accomplishments

1. **Detailed Mechanism Clarification**:
   - Explained to the user how trending demand queries are tracked: whenever customers search for products via the AI Shopping Assistant or marketplace search, queries are recorded in the `AIDemandInsight` database table.
   - Clarified threshold: queries are recorded starting from **1 search** (`request_count = 1`), with subsequent searches incrementing the counter (`request_count += 1`).
   - The dashboard ranks queries in descending order of frequency (`ORDER BY request_count DESC, last_requested_at DESC LIMIT 8`), displaying the top 8 live trending demands to sellers and admins.

2. **Connected Standard Search to Demand Insights**:
   - Connected `backend/src/api/search.py` so standard search bar queries also feed into `record_customer_demand`.
   - Updated copy in `SellerDashboardScreen.tsx` to reference "AI Plaza shoppers" exclusively.
