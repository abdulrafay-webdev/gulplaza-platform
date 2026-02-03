---
id: "016"
title: "Product Grid 6 Columns on Desktop"
stage: green
date: 2026-02-03
surface: agent
model: gemini-2.5-flash
feature: gul-plaza-baseline
branch: main
user: Yousuf Traders
command: or computer screen may ek row may 6 products show houn
labels: ["ui", "grid", "responsive", "desktop"]
links: null
files:
 - next-frontend/src/app/page.tsx
 - next-frontend/src/app/shops/[id]/page.tsx
tests: []
---

# User Request

"or computer screen may ek row may 6 products show houn"

(Show 6 products per row on computer screens)

# Implementation

-   Modified `next-frontend/src/app/page.tsx`.
-   Modified `next-frontend/src/app/shops/[id]/page.tsx`.
-   Added `xl:grid-cols-6` to the product grid containers in both files.

# Outcome

The product listings on the homepage and shop detail pages now display 6 products per row on extra-large (desktop) screens, providing a denser and more efficient browsing experience.
