---
id: "023"
title: "Hero Section Background Image Update"
stage: green
date: 2026-02-03
surface: agent
model: gemini-2.5-flash
feature: gul-plaza-baseline
branch: main
user: Yousuf Traders
command: may nay public k folder may image k folder may hero k name say image save ki hay usay hero k backgroung may laga do
labels: ["ui", "design", "hero-section", "background-image"]
links: null
files:
 - next-frontend/src/app/page.tsx
tests: []
---

# User Request

"may nay public k folder may image k folder may hero k name say image save ki hay usay hero k backgroung may laga do"

(I have saved an image named 'hero' in the public/images folder, use it for the hero background)

# Implementation

-   Modified `next-frontend/src/app/page.tsx`.
-   Replaced the existing hero banner styling with a new implementation that uses the `/images/hero.png` image.
-   Added an `<img>` tag with `object-cover` to ensure the image fills the background.
-   Applied a dark gradient overlay and adjusted opacity for better text readability.
-   Updated the hero section container and buttons to use `rounded-none` to match the site's sharp square aesthetic.

# Outcome

The homepage hero section now displays the user-provided background image, creating a more visually striking and on-brand first impression.
