---
id: "032"
title: "Circular Horizontal Shop Scroller with Compact Mobile Sizing"
stage: green
date: 2026-08-21
surface: agent
model: gemini-3.7-flash
feature: gul-plaza-baseline
branch: main
user: Yousuf Traders
command: acha shops show houn round may or side may scroll houn or mobile screen per shop ka size chota ho zyada bara na ho
labels: ["circular-shops", "horizontal-scroll", "mobile-compact", "ui-ux"]
links: null
files:
 - next-frontend/src/app/page.tsx
tests:
 - npm.cmd run build
---

# User Request

"acha shops show houn round may or side may scroll houn or mobile screen per shop ka size chota ho zyada bara na ho"

# Implementation Summary

- Added a compact, horizontal side-scrolling shop strip on the homepage ([`page.tsx`](file:///D:/gul-plaza/next-frontend/src/app/page.tsx)).
- Designed circular `rounded-full` avatars with purple-cyan gradient rings and verified badges.
- Configured mobile-optimized compact sizing (`w-12 h-12` / 48px avatars on mobile, `w-14 h-14` on desktop) with short truncated store names so multiple stores fit across the screen with smooth touch swipe/scroll.
- Verified compilation and build via `npm run build`.

# Outcome

Homepage now displays a clean, compact, circular horizontal store scroller optimized for mobile screens.
