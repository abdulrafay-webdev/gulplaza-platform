---
id: "092"
title: "Fix Vercel Backend 404 Rewrite Path Resolution"
stage: "green"
date: "2026-09-08"
surface: "agent"
model: "inherit"
feature: "gul-plaza-baseline"
branch: "1-gul-plaza-baseline"
user: "abdulrafay-webdev"
command: "fix vercel backend 404 not found on api routes"
labels: ["vercel", "fastapi", "serverless", "rewrites", "path-resolver", "bugfix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
  conversation: "conversation://8de147ad-2ed8-4ec5-9fcc-91f6fe87cbc7"
files:
  - backend/api/index.py
  - backend/src/main.py
  - backend/vercel.json
tests:
  - python -m py_compile backend/api/index.py backend/src/main.py
  - TestClient path resolution simulation with x-matched-path
---

## Prompt

Failed to load resource: the server responded with a status of 404 ()
gulplaza-platform-backend.vercel.app/api/v1/shops/:1  Failed to load resource: the server responded with a status of 404 ()
c43c962551d2d025.js:1 Failed to load home data Y
(anonymous) @ c43c962551d2d025.js:1
gulplaza-platform-backend.vercel.app/api/v1/recent?limit=6:1  Failed to load resource: the server responded with a status of 404 ()

## Response snapshot

Diagnosed the root cause of the backend 404 `{"detail": "Not Found"}` errors on `gulplaza-platform-backend.vercel.app`. When Vercel rewrites `/(.*)` to `/api/index.py`, the ASGI scope path received by FastAPI is set to `/api/index.py`, while the true client request path is passed in the `x-matched-path` or `x-forwarded-uri` header. Since FastAPI had no route matching `/api/index.py`, it threw a 404 for all endpoints. Added `vercel_path_resolver` ASGI middleware in `backend/api/index.py` to restore the original client path into `scope["path"]`, normalized the rewrite destination in `backend/vercel.json` to `/api/index.py`, and added a direct `/debug-status` endpoint in `backend/src/main.py`.

## Outcome

- ✅ Impact: All API routes (`/api/v1/shops/`, `/api/v1/recent`, etc.) are now correctly resolved on Vercel Serverless without 404 failures.
- 🧪 Tests: Verified with Python TestClient simulation with `x-matched-path`; compiled successfully.
- 📁 Files: `backend/api/index.py`, `backend/src/main.py`, `backend/vercel.json`.
- 🔁 Next prompts: Commit, push to GitHub, and verify live endpoints.
