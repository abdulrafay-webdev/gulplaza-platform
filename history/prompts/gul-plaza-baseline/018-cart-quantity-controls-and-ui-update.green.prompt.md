---
id: "018"
title: "Cart Quantity Controls and UI Update"
stage: green
date: 2026-02-03
surface: agent
model: gemini-2.5-flash
feature: gul-plaza-baseline
branch: main
user: Yousuf Traders
command: cart say product ki quantity kam zyada karnay ka option do
labels: ["ui", "cart", "ux", "quantity-controls"]
links: null
files:
 - next-frontend/src/context/CartContext.tsx
 - next-frontend/src/components/Cart.tsx
tests: []
---

# User Request

"cart say product ki quantity kam zyada karnay ka option do"

(Give option to increase or decrease product quantity from the cart)

# Implementation

-   Modified `next-frontend/src/context/CartContext.tsx`:
    -   Added `updateQuantity` function to the context to allow updating item quantity by product ID.
    -   Ensured minimum quantity is 1.
-   Modified `next-frontend/src/components/Cart.tsx`:
    -   Implemented Plus and Minus buttons for each cart item.
    -   Replaced the "Remove" text button with a stylish `Trash2` icon.
    -   Updated the layout of cart items to be more compact and professional.
    -   Applied `rounded-none` to all new UI elements (buttons, containers) to match the "sharp square" design requirement.

# Outcome

Users can now easily adjust the quantity of products directly within the cart drawer or sidebar. The UI is cleaner and follows the consistent sharp-edged design of the rest of the application.
