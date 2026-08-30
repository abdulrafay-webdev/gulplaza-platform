---
id: "044"
title: "Implement Multi-Turn Conversation Memory, Negation Filtering, and Gift Recommendation Intelligence"
stage: green
date: 2026-08-30
surface: agent
model: gemini-2.5-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: kuch gift k liyay batao ... kisi ko gift dayna hay kuch suggest karo ... nhi shoes nhi ... is tarah say work kar raha hay ye sahi nhi hay , har tarah say is say baat kari jaa sakay or ye intelligently handle karay
labels: ["multi-turn-memory", "chat-history", "negations", "gift-recommendations", "conversational-ai"]
links: null
files:
 - backend/src/services/ai_provider.py
 - backend/src/services/ai_shopping_service.py
 - backend/test_multiturn_flow.py
tests:
 - python test_multiturn_flow.py
---

# User Request

The user shared a real conversation where:
1. User asked for gift suggestions ("kuch gift k liyay batao") and AI responded with "not available".
2. When asked again, AI suggested running shoes.
3. User said: "nhi shoes nhi" (negation constraint), but AI dumped 3 more shoes because it lacked conversation memory and treated "shoes" in isolation as the positive search term.

# Root Cause & Fix

1. **Multi-Turn Chat History**:
   - `process_ai_message` was only passing single messages in isolation.
   - Now loads up to 10 previous messages (`history`) from `chat.messages` and passes full context to Gemini for both intent extraction and recommendation generation.
2. **Negation & Constraint Handling**:
   - When the user rejects a category (e.g. "nhi shoes nhi", "shoes ke ilawa"), Gemini detects the negative intent and places it into `negative_terms: ["shoes", "footwear", "sneakers"]`.
   - `search_candidate_products` strictly excludes all items matching negative terms.
   - Gemini pivots to alternative gift categories (Perfumes, Smartwatches, Earbuds, Cookware) while retaining the original context.
3. **Gift Query Intelligence**:
   - Broad gift queries automatically curate diverse top-tier products across Fragrances, Tech Gadgets, Cookware, and Fashion rather than saying out-of-stock.
4. **Small Talk & Greetings**:
   - Pure conversational queries (e.g. "salam", "shukriya", "theek hay") return warm, polite Roman Urdu responses without forcing random product cards.

# Verification

- Automated test `test_multiturn_flow.py` reproduced the user's exact 4-turn dialog and passed 100%.
