---
id: "015"
title: "Desktop Cart to Navbar Icon"
stage: green
date: 2026-02-03
surface: agent
model: gemini-2.5-flash
feature: gul-plaza-baseline
branch: main
user: Yousuf Traders
command: your cart wala card desktop screen say bhi hata do or usay uper navbar may basket k icon laga kar us may kardo stylish sa
labels: ["ui", "cart", "navbar", "responsive"]
links: null
files:
 - next-frontend/src/components/PublicLayout.tsx
tests: []
---

# User Request

"your cart wala card desktop screen say bhi hata do or usay uper navbar may basket k icon laga kar us may kardo stylish sa"

(Remove the cart card from the desktop screen and move it to the navbar with a stylish basket icon)

# Implementation

-   Modified `next-frontend/src/components/PublicLayout.tsx`.
-   Removed the desktop-only sidebar `aside` that contained the `<Cart />`.
-   Updated the Navbar to include a unified `ShoppingBag` icon (basket) that is visible on all screen sizes.
-   Configured the cart icon to trigger the existing "Cart Drawer" (overlay) mechanism for both mobile and desktop users.
-   Added a pulsing notification badge to the cart icon to indicate item count.
-   Removed the floating mobile cart button to clean up the UI, as the navbar icon now serves this purpose globally.

# Outcome

The floating/sidebar cart is gone. Users on desktop now access the cart via a stylish basket icon in the navbar, which opens the cart in a smooth drawer overlay, matching the mobile experience.
