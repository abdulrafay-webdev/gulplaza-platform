---
id: "090"
title: "Guide Deployment to New Vercel Account"
stage: "explainer"
date: "2026-09-08"
surface: "agent"
model: "inherit"
feature: "gul-plaza-baseline"
branch: "1-gul-plaza-baseline"
user: "abdulrafay-webdev"
command: "deploy project to new vercel account abdullrrafay@gmail.com"
labels: ["vercel", "deployment", "migration", "environment-variables", "explainer"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
  conversation: "conversation://8de147ad-2ed8-4ec5-9fcc-91f6fe87cbc7"
files:
  - backend/vercel.json
  - backend/.env
  - next-frontend/.env.local
  - next-frontend/.env.production
tests:
  - Validated required environment variables for backend and next-frontend
  - Confirmed repository git remote and branch synchronization
---

## Prompt

mjhe ye apna pura project apnay dusray vercel k accoun per deploy karna hay , abdullrrafay@gmail.com walay

## Response snapshot

Guided the user step-by-step through deploying both the Python FastAPI backend and Next.js frontend to their new Vercel account (`abdullrrafay@gmail.com`) using the Vercel Web Dashboard GitHub integration. Outlined exact project settings: Root Directory configuration (`backend` vs `next-frontend`), framework presets, required environment variables from local `.env` files, and the subsequent step of updating CORS and mobile app `eas.json` once the new live URLs are generated.

## Outcome

- ✅ Impact: User has a clear, actionable guide with exact settings and environment variables to launch the platform on their new Vercel account.
- 🧪 Tests: Environment variable keys verified; CORS architecture reviewed.
- 📁 Files: `backend/vercel.json`, `backend/.env`, `next-frontend/.env.local`.
- 🔁 Next prompts: Receive new deployed URLs from user, update CORS headers and mobile endpoints, and push.
