---
id: "038"
title: "Phase 1 Codebase Analysis and AI Shopping Assistant Architectural Plan"
stage: plan
date: 2026-08-25
surface: agent
model: gemini-3.7-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: Master Prompt - AI Shopping Assistant Integration (Phase 1 Codebase Analysis and Architectural Planning)
labels: ["ai-assistant", "rag-shopping", "codebase-analysis", "architecture-plan", "multimodal-vision"]
links: null
files: []
tests: []
---

# User Request

User initiated integration of a complete AI Shopping Assistant into the existing multi-vendor marketplace platform. Required Phase 1 comprehensive codebase analysis and architectural planning without modifying existing application code during analysis.

# Phase 1 Analysis Summary

1. **Project Architecture:** Next.js 16 (Turbopack, Tailwind CSS) frontend + FastAPI (Python 3.13, SQLModel, PostgreSQL Neon) backend.
2. **Authentication:** Dual-support for Customers (Neon DB JWT in `CustomerContext`) and Sellers/Admins (Clerk JWT).
3. **Database Schema:** Neon PostgreSQL with `Shop`, `Product`, `ProductImage`, `Category`, `SubCategory`, `Order`, `OrderItem`, `Review`, `Customer`.
4. **Integration Plan:**
   - Add `AIChat` and `AIMessage` SQLModel tables in `src/models/ai_chat.py`.
   - Build modular `AIProvider` service abstraction (Gemini / OpenAI / Groq / Fallback) with hybrid deterministic database search + LLM RAG recommendation pipeline.
   - Add `/api/v1/ai/` endpoints (`chats`, `messages`, `upload-image`).
   - Replace mobile center nav action with elevated Neon AI Assistant button and create full `/ai` chat interface with interactive product cards.
5. **AI Provider Recommendation:** Recommended **Google Gemini 2.0 Flash** for fast latency, native multimodal vision, Roman Urdu fluency, and cost efficiency.

# Outcome

Phase 1 complete. Awaiting user AI provider confirmation / API key to proceed to Phase 2 implementation.
