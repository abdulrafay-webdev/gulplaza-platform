---
id: "019"
title: "Product Images in Cart"
stage: green
date: 2026-02-03
surface: agent
model: gemini-2.5-flash
feature: gul-plaza-baseline
branch: main
user: Yousuf Traders
command: cart may choti si image bhi show ho product ki choti si square may
labels: ["ui", "cart", "ux", "images"]
links: null
files:
 - next-frontend/src/context/CartContext.tsx
 - next-frontend/src/app/page.tsx
 - next-frontend/src/app/shops/[id]/page.tsx
 - next-frontend/src/app/products/[id]/page.tsx
 - next-frontend/src/components/Cart.tsx
tests: []
---

# User Request

"cart may choti si image bhi show ho product ki choti si square may"

(Show a small square image of the product in the cart)

# Implementation

-   Modified `next-frontend/src/context/CartContext.tsx` to include `image_url` in the `CartItem` type.
-   Updated `addToCart` calls in `next-frontend/src/app/page.tsx`, `next-frontend/src/app/shops/[id]/page.tsx`, and `next-frontend/src/app/products/[id]/page.tsx` to pass the product's image URL.
-   Updated `next-frontend/src/components/Cart.tsx` to render the small square image next to the product details in each cart item.
-   Ensured the images follow the "sharp square" design (`rounded-none`).

# Outcome

The cart now displays a small square thumbnail for each added product, making it easier for users to identify their items visually.
