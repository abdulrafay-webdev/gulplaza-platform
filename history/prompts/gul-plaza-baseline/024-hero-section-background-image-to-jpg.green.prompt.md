---
id: "024"
title: "Hero Section Background Image to JPG"
stage: green
date: 2026-02-03
surface: agent
model: gemini-2.5-flash
feature: gul-plaza-baseline
branch: main
user: Yousuf Traders
command: hero.jpg
labels: ["ui", "design", "hero-section", "background-image"]
links: null
files:
 - next-frontend/src/app/page.tsx
tests: []
---

# User Request

"hero.jpg"

(Change hero background image to hero.jpg)

# Implementation

-   Modified `next-frontend/src/app/page.tsx`.
-   Updated the `src` attribute of the hero background image from `/images/hero.png` to `/images/hero.jpg`.

# Outcome

The hero section now correctly displays the `hero.jpg` image as its background.
