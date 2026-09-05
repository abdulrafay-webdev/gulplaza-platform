---
id: "078"
title: "Audit and Plan Platform AI Migration from Google Gemini to OpenAI"
stage: plan
date: 2026-09-05
surface: agent
model: gemini-3.8-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "MASTER PROMPT — MIGRATE ENTIRE AI PLAZA PLATFORM FROM GEMINI TO OPENAI"
labels: ["openai-migration", "gemini-audit", "architecture-plan", "ai-provider"]
links: null
files:
 - backend/src/services/ai_provider.py
 - backend/src/services/ai_shopping_service.py
 - backend/src/api/ai_chat.py
 - backend/requirements.txt
 - backend/.env
tests:
 - Audited all package.json files (Next.js, Customer Mobile, Seller Mobile, Admin Mobile)
 - Verified all mobile and web apps route AI calls strictly through FastAPI backend
 - Verified no API keys are tracked in git or exposed to client bundles
 - Tested installation of openai package in backend venv
---

# Accomplishments

1. **Comprehensive Repository Audit**:
   - Discovered that all 4 client applications (Next.js web, customer mobile, seller mobile, admin mobile) already route 100% of their AI interactions through the centralized FastAPI backend (`/api/v1/ai/...`). No frontend or mobile app calls Gemini directly or holds any AI keys.
   - Identified the exact service files where Gemini API calls take place: `backend/src/services/ai_provider.py` and `backend/src/services/ai_shopping_service.py`.
   - Verified that `backend/.env` is ignored by git and confirmed zero `sk-` OpenAI keys exist in git history or tracked configuration files.

2. **Migration Plan Formulation**:
   - Designed the `OpenAIProvider(AIProvider)` architecture utilizing `gpt-4o-mini` with fallback to `gpt-4o`.
   - Maintained two-stage retrieval: OpenAI extracts customer intent and ranks provided catalog items, while Neon PostgreSQL guarantees only real verified products with active stock are recommended.
   - Added multimodal vision support via OpenAI's `image_url` block.
   - Preserved chat history memory (up to 8 turns) and natural Roman Urdu conversational tone.
