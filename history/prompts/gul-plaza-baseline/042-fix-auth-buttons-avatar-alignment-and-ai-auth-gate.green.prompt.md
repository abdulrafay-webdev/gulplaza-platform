---
id: "042"
title: "Fix Auth Buttons Styling, Header Profile Circle Alignment, and AI Chat Login Validation Gate"
stage: green
date: 2026-08-25
surface: agent
model: gemini-3.7-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: acha ab UI may thori bohot changing karni hay , jaisay login wagera k form may button ka color sahi karo because jab us per hover karta hain tou phir nazar aata hay , or profile icon jo hay uskay outside ka circle uper neechay hua wa hay , or AI chat per jab login nhi huay hotay tou bhi woh open hojati hay but response nhi dayti isay set karo jab AI chat open ho tou pehlay validate ho agar login hay tou AI chat open ho nhi tou login page per divert karo
labels: ["ui-fixes", "auth-buttons", "avatar-circle", "ai-auth-gate", "redirect-flow"]
links: null
files:
 - next-frontend/src/app/login/page.tsx
 - next-frontend/src/app/signup/page.tsx
 - next-frontend/src/components/PublicLayout.tsx
 - next-frontend/src/app/ai/page.tsx
tests:
 - npm.cmd run build
---

# User Request

User requested:
1. Fix login and signup button colors so text and button are clearly visible at all times (not only on hover).
2. Fix profile avatar outer circle alignment in the header so it is perfectly centered.
3. Fix AI chat authentication gate: if user is not logged in when accessing `/ai` (or clicking AI button), validate authentication immediately and divert/redirect to `/login?redirect=/ai` instead of letting an unauthenticated session sit on the chat screen.

# Implementation Summary

1. **Login & Signup Buttons ([`login/page.tsx`](file:///D:/gul-plaza/next-frontend/src/app/login/page.tsx), [`signup/page.tsx`](file:///D:/gul-plaza/next-frontend/src/app/signup/page.tsx)):**
   - Replaced old `bg-accent text-white hover:bg-amber-600` with high-contrast, solid gradient buttons (`bg-gradient-to-r from-[#A163F7] via-[#6F88FC] to-[#45E3FF] text-white font-black py-3.5 rounded-2xl shadow-lg`).
   - Added dynamic `?redirect=` query param support so signing in routes the user straight back to their intended destination (e.g. `/ai`).
2. **Profile Circle Alignment ([`PublicLayout.tsx`](file:///D:/gul-plaza/next-frontend/src/components/PublicLayout.tsx)):**
   - Cleaned up Clerk `UserButton` styling with `appearance={{ elements: { avatarBox: "w-8 h-8 rounded-full ring-2 ring-[#A163F7]/50 shadow-sm" } }}` inside `flex items-center justify-center flex-shrink-0`.
   - Updated customer account badge with a centered circular avatar.
3. **AI Chat Authentication Gate ([`ai/page.tsx`](file:///D:/gul-plaza/next-frontend/src/app/ai/page.tsx), [`PublicLayout.tsx`](file:///D:/gul-plaza/next-frontend/src/components/PublicLayout.tsx)):**
   - Added immediate auth validation gate with `router.replace('/login?redirect=/ai')` when `customerLoaded && userLoaded` are ready.
   - Updated desktop header and mobile bottom AI Assistant links to point to `/login?redirect=/ai` when unauthenticated.

# Outcome

Clean Next.js production build (`19/19 routes` compiled with 0 errors in 6.0s).
