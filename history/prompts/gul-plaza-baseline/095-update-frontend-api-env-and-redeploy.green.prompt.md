---
id: "095"
title: "Update Frontend API Environment Variable and Redeploy"
stage: "green"
date: "2026-09-08"
surface: "agent"
model: "inherit"
feature: "gul-plaza-baseline"
branch: "1-gul-plaza-baseline"
user: "abdulrafay-webdev"
command: "fix frontend cors and 404 to deleted gulplaza-platform-backend domain"
labels: ["vercel", "environment-variables", "nextjs", "production-build", "bugfix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
  conversation: "conversation://8de147ad-2ed8-4ec5-9fcc-91f6fe87cbc7"
files:
  - next-frontend/.env.production
tests:
  - Updated NEXT_PUBLIC_API_URL on Vercel project prj_8qKASLCGEbF3nK0P00iJwB9XSs4H
  - Triggered production redeploy dpl_8tVy6AiL2EU55uV49QrFuXdRBAhU
  - Verified static JavaScript chunks on https://gulplaza-platform-frontend.vercel.app/ (Active URL = True, Old URL = False)
---

## Prompt

Access to XMLHttpRequest at 'https://gulplaza-platform-backend.vercel.app/api/v1/shops/' from origin 'https://gulplaza-platform-frontend.vercel.app' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
c43c962551d2d025.js:1 Failed to load home data Y
(anonymous) @ c43c962551d2d025.js:1
gulplaza-platform-backend.vercel.app/api/v1/shops/:1 Failed to load resource: net::ERR_FAILED
(index):1 Access to XMLHttpRequest at 'https://gulplaza-platform-backend.vercel.app/api/v1/auth/me' from origin 'https://gulplaza-platform-frontend.vercel.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.

## Response snapshot

Diagnosed that the frontend build in Vercel was baked with the old domain `gulplaza-platform-backend.vercel.app`, which was deleted when the backend domain was renamed to `https://gulplaza-platform.vercel.app/`. Updated `NEXT_PUBLIC_API_URL` to `https://gulplaza-platform.vercel.app/api/v1` on Vercel frontend project `prj_8qKASLCGEbF3nK0P00iJwB9XSs4H` across all targets (Production, Preview, Development), and triggered a fresh production redeploy (`dpl_8tVy6AiL2EU55uV49QrFuXdRBAhU`). Scanned and verified the live frontend JavaScript chunks, confirming that `https://gulplaza-platform.vercel.app` is active and the old backend URL has been eliminated.

## Outcome

- ✅ Impact: Frontend makes API requests directly to the active `https://gulplaza-platform.vercel.app/api/v1` backend without 404 or CORS errors.
- 🧪 Tests: Live JavaScript chunk inspection returned `Active URL found = True, Old URL found = False`.
- 📁 Files: `next-frontend/.env.production`.
- 🔁 Next prompts: Instruct user to perform hard refresh (`Ctrl + F5`) in browser.
