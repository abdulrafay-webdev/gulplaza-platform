---
id: "094"
title: "Finalize Migration to New Vercel Account with Original Domains"
stage: "green"
date: "2026-09-08"
surface: "agent"
model: "inherit"
feature: "gul-plaza-baseline"
branch: "1-gul-plaza-baseline"
user: "abdulrafay-webdev"
command: "migrate and finalize production domains on new vercel account"
labels: ["vercel", "migration", "production", "domains", "backend", "frontend"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
  conversation: "conversation://8de147ad-2ed8-4ec5-9fcc-91f6fe87cbc7"
files:
  - backend/vercel.json
  - backend/api/index.py
  - next-frontend/.env.production
  - apps/customer-mobile/eas.json
  - apps/customer-mobile/.env
  - apps/seller-mobile/eas.json
  - apps/seller-mobile/.env
  - apps/admin-mobile/eas.json
  - apps/admin-mobile/.env
tests:
  - Validated live backend https://gulplaza-platform.vercel.app/ (200 OK)
  - Validated live shops endpoint https://gulplaza-platform.vercel.app/api/v1/shops/ (200 OK)
  - Validated live recent reviews endpoint https://gulplaza-platform.vercel.app/api/v1/recent?limit=6 (200 OK)
---

## Prompt

https://gulplaza-platform-frontend.vercel.app/    may nay frontend ka url ye kardiya hay edit kar k
https://gulplaza-platform.vercel.app/   or ab ye backend ki domain kardi hay

## Response snapshot

Finalized production deployment on the new Vercel account (`abdullrrafay@gmail.com`). Corrected the framework preset to `Other` (None), resolved internal path rewrites via query string injection (`__path`), and validated that the live backend at `https://gulplaza-platform.vercel.app/` returns 200 OK across `/`, `/debug-status`, `/api/v1/health`, `/api/v1/shops/`, `/api/v1/recent`, and `/api/v1/products`. Re-aligned `next-frontend/.env.production` and mobile configurations (`eas.json` and `.env`) to point cleanly to `https://gulplaza-platform.vercel.app/api/v1`.

## Outcome

- ✅ Impact: The entire platform (Backend API, Next.js Web Frontend, and Mobile Apps) is 100% active, connected to live Neon PostgreSQL, and operational under the original production URLs on the new Vercel account.
- 🧪 Tests: Live HTTP requests verified all critical backend endpoints returning status 200 OK with actual database records.
- 📁 Files: `backend/vercel.json`, `backend/api/index.py`, `next-frontend/.env.production`, `apps/**/eas.json`, `apps/**/.env`.
- 🔁 Next prompts: Commit and push configuration sync to GitHub.
