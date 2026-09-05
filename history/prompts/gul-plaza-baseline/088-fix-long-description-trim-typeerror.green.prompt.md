---
id: "088"
title: "Fix Long Description Trim TypeError in Product Form"
stage: "green"
date: "2026-09-05"
surface: "agent"
model: "inherit"
feature: "gul-plaza-baseline"
branch: "1-gul-plaza-baseline"
user: "abdulrafay-webdev"
command: "fix long description trim typeerror"
labels: ["product-form", "bugfix", "ai-description", "type-safety"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
  conversation: "conversation://8de147ad-2ed8-4ec5-9fcc-91f6fe87cbc7"
files:
  - backend/src/api/ai_chat.py
  - next-frontend/src/app/dashboard/products/new/page.tsx
  - next-frontend/src/app/dashboard/products/[id]/edit/page.tsx
  - apps/seller-mobile/src/screens/AddProductScreen.tsx
  - apps/seller-mobile/src/screens/EditProductScreen.tsx
tests:
  - next-frontend production build
---

## Prompt

fb7fec7cc6d32e0a.js:1 Uncaught (in promise) TypeError: (h.long_description || "").trim is not a function
    at F (fb7fec7cc6d32e0a.js:1:3185)
    at sY (94e29e6a8629e3e3.js:1:161797)
    at 94e29e6a8629e3e3.js:1:167685
    at tD (94e29e6a8629e3e3.js:1:30292)
    at s3 (94e29e6a8629e3e3.js:1:163030)
    at fC (94e29e6a8629e3e3.js:1:198996)
    at fP (94e29e6a8629e3e3.js:1:198818)   product add kartay huay ye error araha hay

## Response snapshot

Identified and resolved the root cause of the `TypeError: (h.long_description || "").trim is not a function` error when adding or publishing products. When AI-generated descriptions are returned or populated, if `long_description` is formatted by the model as an array or object of bullet points, JavaScript's `.trim()` fails on non-string types. Added backend sanitization in `/ai/generate-description` to ensure responses are strictly plain strings, and added `toSafeString()` converters across Next.js and React Native forms (`new/page.tsx`, `[id]/edit/page.tsx`, `AddProductScreen.tsx`, `EditProductScreen.tsx`) to guarantee safe string trimming.

## Outcome

- ✅ Impact: Products can now be created and published without crashes, regardless of description formatting.
- 🧪 Tests: Next.js production build succeeded with zero errors.
- 📁 Files: `backend/src/api/ai_chat.py`, `next-frontend/src/app/dashboard/products/new/page.tsx`, `next-frontend/src/app/dashboard/products/[id]/edit/page.tsx`, `apps/seller-mobile/src/screens/AddProductScreen.tsx`, `apps/seller-mobile/src/screens/EditProductScreen.tsx`.
- 🔁 Next prompts: Commit and push changes to GitHub.
