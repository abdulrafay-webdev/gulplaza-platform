---
id: "079"
title: "Complete Platform AI Migration from Google Gemini to OpenAI API"
stage: green
date: 2026-09-05
surface: agent
model: gemini-3.8-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "MASTER PROMPT — MIGRATE ENTIRE AI PLAZA PLATFORM FROM GEMINI TO OPENAI"
labels: ["openai-migration", "gpt-4o-mini", "vision-search", "ai-provider", "security-audit"]
links: null
files:
 - backend/requirements.txt
 - backend/src/services/ai_provider.py
 - backend/src/api/ai_chat.py
 - backend/.env.example
 - apps/customer-mobile/src/shared/types.ts
tests:
 - Executed OpenAIProvider pipeline unit tests with mock completion (conversational turn, vision formatting, text generation, factory instantiation)
 - Verified rule-based fallback when OPENAI_API_KEY is not configured
 - Tested Next.js production build (27/27 static & dynamic pages compiled with 0 errors)
 - Tested customer-mobile Expo export (Android & iOS bundles generated with 0 errors)
 - Tested seller-mobile Expo export (Android & iOS bundles generated with 0 errors)
 - Tested admin-mobile Expo export (Android & iOS bundles generated with 0 errors)
 - Conducted security audit confirming zero API keys tracked in git or exposed to client bundles
---

# Accomplishments

1. **Migrated AI Intelligence Engine from Gemini to OpenAI**:
   - Implemented `OpenAIProvider(AIProvider)` in `backend/src/services/ai_provider.py` utilizing `gpt-4o-mini` with automatic fallback to `gpt-4o`.
   - Preserved the strict two-stage catalog matching architecture: OpenAI interprets intent and extracts demand keywords/attributes, while the backend verifies all IDs against Neon PostgreSQL so no fake/hallucinated products can ever be recommended.
   - Preserved natural Roman Urdu persona, multi-turn conversational memory (up to 8 turns), and polite Pakistani cultural tone.
   - Migrated multimodal image understanding to OpenAI vision (`image_url` block), allowing visual outfit/product matching.
   - Added `generate_text` for AI-powered copywriting on `/ai/generate-description`.
   - Updated factory `get_ai_provider()` to return `OpenAIProvider()`.
   - Added `openai>=1.50.0` to `backend/requirements.txt`.

2. **Full-Stack Compatibility & Zero Client-Side Key Exposure**:
   - Confirmed all 4 client applications (Next.js web, customer mobile, seller mobile, admin mobile) route AI requests exclusively through the backend API gateway.
   - Zero client bundles or repositories contain OpenAI secret keys.
   - Created `backend/.env.example` documenting `OPENAI_API_KEY`.
