---
id: "030"
title: "Remove Featured Shops from Homepage"
stage: green
date: 2026-08-21
surface: agent
model: gemini-3.7-flash
feature: gul-plaza-baseline
branch: main
user: Yousuf Traders
command: acha home page per ye jo featured shop wala option show horaha hay usay hata do
labels: ["homepage-clean", "ui-update", "products-focus"]
links: null
files:
 - next-frontend/src/app/page.tsx
tests:
 - npm.cmd run build
---

# User Request

"acha home page per ye jo featured shop wala option show horaha hay usay hata do"

# Implementation Summary

- Removed the "Featured Shops" section from `next-frontend/src/app/page.tsx`.
- Streamlined the homepage flow: Hero Banner & Categories $\rightarrow$ Value/Trust Badges $\rightarrow$ Marketplace Products Grid.
- Retained full access to the dedicated Shops Directory via `/shops` from the navigation header, mobile bottom bar, and products section link.

# Outcome

Homepage is now cleanly focused on product catalog and hero search without the redundant shop cards block.
