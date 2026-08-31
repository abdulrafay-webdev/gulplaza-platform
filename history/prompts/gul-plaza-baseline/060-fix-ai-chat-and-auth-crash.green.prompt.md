---
id: "060"
title: "Fix AI Chat and Sign In/Sign Up Crashes on Customer Mobile Production APK"
stage: green
date: 2026-08-31
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "Fixed production APK crashes when opening AI Chat and navigating to Sign In / Sign Up by correcting API schemas, removing blocking tab redirects, adding guest banners, and fixing missing component imports"
labels: ["customer-mobile", "ai-chat-fix", "login-crash-fix", "signup-crash-fix", "production-apk-fix"]
links: null
files:
 - apps/customer-mobile/src/screens/AIChatScreen.tsx
 - apps/customer-mobile/src/screens/LoginScreen.tsx
 - apps/customer-mobile/src/screens/SignupScreen.tsx
 - apps/customer-mobile/src/navigation/AppNavigator.tsx
tests:
 - Customer mobile app Expo bundle export verified (4.60 MB, 2781 modules)
 - AST import scan across all mobile applications verified
---

# Accomplishments

1. **Sign In & Sign Up Crash Fix**:
   - Fixed unhandled `ReferenceError: Property 'Image' doesn't exist` and missing `useState` imports in `LoginScreen.tsx` and `SignupScreen.tsx`.
2. **AI Chat Tab & Screen Crash Fix**:
   - Corrected the mismatch between `AIChatScreen.tsx` and `api.ai.createChat` / `api.ai.sendMessage` endpoint payload contracts.
   - Removed the blocking redirect from `CustomTabBar` in `AppNavigator.tsx` that previously forced unauthenticated users to crash directly into `LoginScreen`.
   - Added friendly non-blocking guest banner and safe message reconciliation keys (`key={m.id ? \`msg-\${m.id}\` : \`msg-\${idx}\`}`).
