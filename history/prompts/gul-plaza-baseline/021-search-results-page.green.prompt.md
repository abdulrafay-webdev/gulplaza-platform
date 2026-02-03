---
id: "021"
title: "Search Results Page"
stage: green
date: 2026-02-03
surface: agent
model: gemini-2.5-flash
feature: gul-plaza-baseline
branch: main
user: Yousuf Traders
command: ye abhi tak ki functionality sahi hay is k ilawa jab kuch kar kar search per click ya enter karien tou new page open ho us per starting may 4 related shops show houn or uskay neechay related products show houn
labels: ["feature", "search", "frontend", "ui"]
links: null
files:
 - next-frontend/src/components/SearchBar.tsx
 - next-frontend/src/app/search/page.tsx
tests: []
---

# User Request

"ye abhi tak ki functionality sahi hay is k ilawa jab kuch kar kar search per click ya enter karien tou new page open ho us per starting may 4 related shops show houn or uskay neechay related products show houn"

(Functionality is good so far, but when user presses enter/search, open a new page showing 4 related shops at the top and related products below)

# Implementation

-   Updated `next-frontend/src/components/SearchBar.tsx` to uncomment the `router.push` call in `handleSearchSubmit`, enabling navigation to `/search?q=query` on form submission.
-   Created `next-frontend/src/app/search/page.tsx` as a new page component.
    -   Reads the `q` query parameter.
    -   Calls `search.unified(q)` to fetch results.
    -   Displays a "Related Shops" section (top 4 matches) with sharp square styling (`rounded-none`).
    -   Displays a "Related Products" section below shops with the standard sharp square product card design.
    -   Integrated `useCart` for "Add to Cart" functionality directly from search results.
    -   Handled loading and "No results" states.

# Outcome

Users can now press Enter or click search to view a full page of results. The page structure specifically highlights up to 4 relevant shops first, followed by a grid of relevant products, all adhering to the site's design language.
