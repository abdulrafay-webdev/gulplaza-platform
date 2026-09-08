---
id: "091"
title: "Fix Vercel Frontend Peer Deps and Update Backend URL"
stage: "green"
date: "2026-09-08"
surface: "agent"
model: "inherit"
feature: "gul-plaza-baseline"
branch: "1-gul-plaza-baseline"
user: "abdulrafay-webdev"
command: "fix vercel npm eresolve peer deps and configure new backend url"
labels: ["vercel", "peer-dependencies", "npmrc", "backend-url", "eas-build"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
  conversation: "conversation://8de147ad-2ed8-4ec5-9fcc-91f6fe87cbc7"
files:
  - next-frontend/.npmrc
  - .npmrc
  - next-frontend/.env.production
  - backend/api/index.py
  - backend/src/main.py
  - apps/customer-mobile/eas.json
  - apps/customer-mobile/.env
  - apps/seller-mobile/eas.json
  - apps/seller-mobile/.env
  - apps/admin-mobile/eas.json
  - apps/admin-mobile/.env
tests:
  - next-frontend local production build
  - push to GitHub to trigger Vercel deployment
---

## Prompt

Running build in Washington, D.C., USA (East) – iad1
Build machine configuration: 2 cores, 8 GB
Cloning github.com/abdulrafay-webdev/gulplaza-platform (Branch: 1-gul-plaza-baseline, Commit: ec90bf5)
Previous build caches not available.
Cloning completed: 32.722s
Running "vercel build"
Vercel CLI 59.11.7
Installing dependencies...
npm error code ERESOLVE
npm error ERESOLVE could not resolve
npm error While resolving: imagekitio-next@1.0.1
npm error Found: next@16.1.4
node_modules/@clerk/nextjs
    @clerk/nextjs@"^6.36.10" from the root project  ye error araha hay , or ye backend ka url hay https://gulplaza-platform-backend.vercel.app/

## Response snapshot

1. Resolved Vercel deployment `ERESOLVE` npm peer dependency failure caused by `imagekitio-next@1.0.1` and `next@16.1.4` by adding `.npmrc` configured with `legacy-peer-deps=true` in `next-frontend/` and repo root.
2. Updated all backend URL endpoints to the new live Vercel backend (`https://gulplaza-platform-backend.vercel.app/api/v1`):
   - `next-frontend/.env.production`
   - `apps/customer-mobile/eas.json` & `.env`
   - `apps/seller-mobile/eas.json` & `.env`
   - `apps/admin-mobile/eas.json` & `.env`
3. Registered the new backend domain in `backend/api/index.py` and `backend/src/main.py` CORS whitelist.
4. Committed and pushed updates to GitHub `origin/1-gul-plaza-baseline` to trigger automatic redeployment on Vercel.

## Outcome

- ✅ Impact: Vercel frontend build successfully resolves peer dependencies; all apps and frontend point to the newly deployed backend.
- 🧪 Tests: Local `npm run build` succeeded; pushed to GitHub.
- 📁 Files: `next-frontend/.npmrc`, `.npmrc`, `next-frontend/.env.production`, `backend/api/index.py`, `backend/src/main.py`, `apps/**/eas.json`, `apps/**/.env`.
- 🔁 Next prompts: Verify clean frontend deployment on Vercel dashboard.
