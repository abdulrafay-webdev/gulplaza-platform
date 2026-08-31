---
id: "046"
title: "Resolve Rate Limits, Model 404 Deprecation, and Eliminate Fallback Message Loop"
stage: green
date: 2026-08-31
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: code may mayay kuch changing ki hain woh check karo or ye jo api limits wagera ka issue araha hay isay solve karo , Filhal marketplace mein is requirement ke mutabiq exact item available nahi hai. Aap kuch din baad dobara check kar lijiye ga, main restock karwanay ki koshish karta hoon! har msg may ye araha hay or agar need hay tou ye new api key use karlo [REDACTED_API_KEY]
labels: ["gemini-3.6-flash", "api-limits", "model-fallback", "rate-limits", "speed-optimization"]
links: null
files:
 - backend/src/services/ai_provider.py
 - backend/test_speed_benchmark.py
tests:
 - python test_speed_benchmark.py (Passed)
---

# User Request

The user reported that every message was returning the fallback restock message ("Filhal marketplace mein is requirement ke mutabiq exact item available nahi hai...") and asked to inspect recent code changes, resolve API limits, and configure the new Gemini API Key.

# Root Cause Analysis

1. **Model Deprecation 404 on New API Key**:
   - Google Generative AI returned: `404 NOT_FOUND: This model models/gemini-2.5-flash is no longer available to new users. Please update your code to use models/gemini-3.6-flash`.
   - Because `gemini-2.5-flash` returned 404, the backend silently fell back to the generic out-of-stock message on every message!
2. **Old Quota Exceeded 429**:
   - The previously cached key had reached Google's quota limit.
3. **Artificial Delay in Throttler**:
   - A rigid 4-second mutex sleep had been added which artificially slowed down requests.

# Fix Implemented

1. **Upgraded to `gemini-3.6-flash`**:
   - Set primary model to `gemini-3.6-flash` with automatic fallback cascade (`gemini-3.7-flash`, `gemini-flash-latest`).
2. **Updated Active API Key**:
   - Configured active `GEMINI_API_KEY` in `backend/.env`.
3. **Removed Artificial Throttling**:
   - Cleaned up mutex sleep delays, reducing AI response time to ~2.6 seconds.
4. **Verified Live Response**:
   - Tested live query `"mjhe ye stainless steel electric kettle ko order karna hay"` -> Returned natural order guidance and exact product card with 0 fallback messages.
