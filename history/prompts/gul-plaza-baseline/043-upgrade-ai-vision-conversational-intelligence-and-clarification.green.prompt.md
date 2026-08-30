---
id: "043"
title: "Upgrade AI Visual Vision Search, Conversational Clarification, and Tea Kettle Phonetics"
stage: green
date: 2026-08-30
surface: agent
model: gemini-2.5-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: yar images search wala bhi properly work nhi kar raha us say kuch pucho tou woh kuch or dikhata hay , or text walay ko bhi or zyada set karo k woh sahi say communicate karay ab sirf products dikha raha hay , aesa ho k jo product k baray may usay samjh na aye woh us k baray may sahi say info lay phir search kar k results show karay , abhi may nay tea cattle search kiya tou us nay tea cattle dikhayi hi nhi jab k woh hay
labels: ["ai-vision", "conversational-ai", "clarifying-questions", "phonetic-search", "gemini-2.5-flash"]
links: null
files:
 - backend/src/services/ai_provider.py
 - backend/src/services/ai_shopping_service.py
 - backend/test_ai_intelligence.py
tests:
 - python test_ai_intelligence.py
 - npm.cmd run build
---

# User Request

The user requested:
1. Fix Visual Image Search: AI was returning irrelevant items when an image was uploaded.
2. Natural Conversational Communication: AI should communicate warmly, explain why products are recommended, rather than just dumping raw product IDs.
3. Clarifying Questions on Ambiguity: When a prompt is vague (e.g. "kuch acha dikhao", "gift chahiye"), AI should ask targeted clarifying questions (occasion, demographic, budget) before searching.
4. "tea cattle" / "kettle" Fix: When searching for "tea cattle" (phonetic Roman Urdu for tea kettle), AI must properly find `Stainless Steel Fast Electric Kettle 2.0L`.

# Root Cause & Fix

1. **Gemini 2.5 Flash Endpoint**: Migrated from 404/deprecated endpoints to `gemini-2.5-flash`.
2. **Visual Image Search**:
   - Fixed Base64 Data URI decoding in `_fetch_image_base64()` so vision receives raw image parts.
   - Enhanced vision prompt to extract visual item type, material, style, and intent (similar vs complementary).
3. **Conversational Clarification**:
   - Added `needs_clarification` and `clarification_question` to intent schema.
   - Prompts for occasion, gender, or budget when query is underspecified.
4. **Phonetic & Synonym Search Engine**:
   - Added comprehensive Roman Urdu mappings for `cattle -> kettle`, `sitchen -> cookware/kitchen`, `ghari -> smartwatch`, `jootay -> shoes`.
   - Tuned candidate relevance scoring in SQL & Python.

# Verification

- Automated test suite `test_ai_intelligence.py` passed with 4/4 passing tests.
- Next.js production build succeeded with 0 errors across 19/19 routes.
