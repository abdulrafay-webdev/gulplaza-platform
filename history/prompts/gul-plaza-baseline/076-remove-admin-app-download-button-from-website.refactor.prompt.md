---
id: "076"
title: "Remove Admin App Download Button from Website Footer"
stage: refactor
date: 2026-09-02
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "acha website say admin app download karnay ka option hata do"
labels: ["website-footer", "app-downloads", "security", "ui-cleanup"]
links: null
files:
 - next-frontend/src/components/PublicLayout.tsx
tests:
 - Next.js production build verified (27/27 static & dynamic pages compiled with 0 errors)
---

# Accomplishments

1. **Removed Admin App Download Option from Website**:
   - Removed the Admin APK download button from the public footer in `next-frontend/src/components/PublicLayout.tsx`.
   - The public app download section now strictly presents the **Customer App** and **Seller App** download options.
   - Preserved all other footer elements and verified clean production build (27/27 pages).
