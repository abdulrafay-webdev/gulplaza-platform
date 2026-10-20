---
id: 100
title: Fix Psycopg Datetime Timezone Compatibility
stage: green
date: 2026-10-20
surface: agent
model: gemini
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: user
command: null
labels: ["psycopg", "timezone", "datetime", "postgres", "sqlmodel", "seller-register"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/models/user.py
  - backend/src/models/customer.py
  - backend/src/models/order.py
  - backend/src/models/review.py
  - backend/src/models/ai_chat.py
  - backend/src/services/ai_shopping_service.py
tests:
  - python backend/test_wholesale_marketplace_suite.py
---

## Prompt

Failed to register shop: (builtins.ValueError) Datetime values must have timezone information. Use datetime.now(timezone.utc), or annotate the field with NaiveDatetime for naive storage. [SQL: INSERT INTO "user" (email, phone, full_name, role, seller_type, is_active, shop_id, id, hashed_password, created_at) VALUES (%(email)s::VARCHAR, %(phone)s::VARCHAR, %(full_name)s::VARCHAR, %(role)s::VARCHAR, %(seller_type)s::VARCHAR, %(is_active)s, %(shop_id)s::INTEGER, %(id)s::VARCHAR, %(hashed_password)s::VARCHAR, %(created_at)s::TIMESTAMP WITH TIME ZONE)] [parameters: [{'shop_id': 22, 'full_name': 'ali shah', 'role': 'SELLER', 'phone': '03000000000', 'seller_type': 'WHOLESALE', 'created_at': datetime.datetime(2026, 1 ... (60 characters truncated) ... ive': True, 'id': 'seller_c0dd5f2a5ef9', 'hashed_password': '$pbkdf2-sha256$29000$BUAoJcTYO4cwxrjXGsOYUw$OONBXwJ8JVDSRnCu1GS7pR0enRaynj13WgrZUMQTMTA'}]]   wholesale seller register kartay huay ye araha hay

## Response snapshot

Resolved `Datetime values must have timezone information` error during seller registration:
1. Replaced naive `datetime.utcnow` defaults across SQLModel models (`User`, `Customer`, `Order`, `Review`, `AIChat`, `AIMessage`, `AIDemandInsight`) with timezone-aware `get_utc_now` returning `datetime.now(timezone.utc)`.
2. Updated `ai_shopping_service` timestamps to use `datetime.now(timezone.utc)`.
3. Verified user creation and table insertions in Neon PostgreSQL using psycopg.
4. Ran full integration test suite with 100% pass across all tests A through I.

## Outcome

- ✅ Impact: Psycopg 3 strictly enforces timezone awareness on PostgreSQL `TIMESTAMP WITH TIME ZONE` columns; now all models provide compliant aware UTC timestamps.
- 🧪 Tests: 100% pass on wholesale test suite and direct Neon insert verification.
- 📁 Files: `backend/src/models/user.py`, `backend/src/models/customer.py`, `backend/src/models/order.py`, `backend/src/models/review.py`, `backend/src/models/ai_chat.py`, `backend/src/services/ai_shopping_service.py`.
- 🔁 Next prompts: None.
- 🧠 Reflection: Psycopg 3 deprecates naive datetimes for TIMESTAMPTZ columns unlike psycopg2, making timezone-aware datetime.now(timezone.utc) mandatory.

## Evaluation notes (flywheel)

- Failure modes observed: Naive datetime rejected by psycopg 3 for TIMESTAMPTZ column.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Push to GitHub remote to trigger Vercel redeployment.
