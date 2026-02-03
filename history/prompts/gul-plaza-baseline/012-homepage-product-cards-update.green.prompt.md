---
id: "012"
title: "Homepage Product Cards Update"
stage: green
date: 2026-02-03
surface: agent
model: gemini-2.5-flash
feature: gul-plaza-baseline
branch: main
user: Yousuf Traders
command: home page per jo products show haorahi hain unkay card bhi shop k andar walay product card ki tarah show houn
labels: ["ui", "product-cards", "homepage", "consistency"]
links: null
files:
 - next-frontend/src/app/page.tsx
tests: []
---

# User Request

"home page per jo products show haorahi hain unkay card bhi shop k andar walay product card ki tarah show houn"

(Update homepage product cards to match the style of product cards inside the shop page)

# Implementation

-   Imported `useCart` hook in `next-frontend/src/app/page.tsx` to enable "Add to Cart" and "Buy Now" functionality directly from the homepage.
-   Replaced the existing product card implementation in `next-frontend/src/app/page.tsx` with the implementation from `next-frontend/src/app/shops/[id]/page.tsx`.
-   Adapted the "Add to Cart" logic to use `product.shop_id` instead of the shop context (since the homepage lists products from multiple shops).
-   Included fallback for images using `product.image_url` or the first image from `product.images`.
-   Removed unused `ShoppingBag` icon import.
-   Verified `shop_id` is available in `ProductRead` schema.

# Outcome

The homepage product cards now visually match the shop page product cards and include "Add to Cart" and "Buy Now" buttons.
