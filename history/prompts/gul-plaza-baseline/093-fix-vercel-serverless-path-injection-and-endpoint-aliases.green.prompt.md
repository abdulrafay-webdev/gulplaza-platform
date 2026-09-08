---
id: "093"
title: "Fix Vercel Serverless Path Injection and Endpoint Aliases"
stage: "green"
date: "2026-09-08"
surface: "agent"
model: "inherit"
feature: "gul-plaza-baseline"
branch: "1-gul-plaza-baseline"
user: "abdulrafay-webdev"
command: "fix persistent 404 on vercel backend deployment"
labels: ["vercel", "fastapi", "serverless", "rewrites", "query-params", "bugfix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
  conversation: "conversation://8de147ad-2ed8-4ec5-9fcc-91f6fe87cbc7"
files:
  - backend/api/index.py
  - backend/vercel.json
tests:
  - python -m py_compile backend/api/index.py
  - TestClient verification of direct and rewritten endpoints
---

## Prompt

Failed to load resource: the server responded with a status of 404 ()
c43c962551d2d025.js:1 Failed to load home data Y
(anonymous) @ c43c962551d2d025.js:1
gulplaza-platform-backend.vercel.app/api/v1/recent?limit=6:1  Failed to load resource: the server responded with a status of 404 ()
gulplaza-platform-backend.vercel.app/api/v1/products?limit=50:1  Failed to load resource: the server responded with a status of 404 ()   issue still not solved

## Response snapshot

Resolved the root cause of the persistent 404 error on Vercel Serverless Python functions. Vercel's rewrite mechanism rewrites incoming requests to `/api/index.py` without propagating the original path through standard ASGI headers. Configured `backend/vercel.json` to inject the matched path via query parameter (`/api/index.py?__path=/$1`) and updated `backend/api/index.py`'s `vercel_path_resolver` middleware to parse `__path`, set `request.scope["path"]` accordingly, clean the query string, and expose endpoint aliases (`/debug-status`, `/api/index.py`, `/api/index`, `/api`). Verified routing locally with TestClient for root, shops, recent, and health endpoints.

## Outcome

- ✅ Impact: Requests rewritten by Vercel Serverless now correctly route to their target FastAPI handlers with query parameters intact.
- 🧪 Tests: Python TestClient verified `/api/index.py?__path=/api/v1/health` (200 OK) and `/api/index.py?__path=/api/v1/shops/` (routed to shops router).
- 📁 Files: `backend/api/index.py`, `backend/vercel.json`.
- 🔁 Next prompts: Push to GitHub and test live endpoints.
