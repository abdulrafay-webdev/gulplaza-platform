---
id: 098
title: Mobile App Run and Build Commands Guide
stage: explainer
date: 2026-10-20
surface: agent
model: gemini
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: user
command: null
labels: ["mobile", "expo", "react-native", "eas-build", "apk", "guide"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - apps/customer-mobile/package.json
  - apps/seller-mobile/package.json
  - apps/admin-mobile/package.json
  - apps/customer-mobile/eas.json
  - apps/seller-mobile/eas.json
  - apps/admin-mobile/eas.json
tests:
  - null
---

## Prompt

mobile app run or build creare karnay ki command do

## Response snapshot

Provided comprehensive step-by-step instructions and commands for running and building the mobile apps (customer-mobile, seller-mobile, admin-mobile):
1. Development run commands using Expo (`npx expo start`, `npm start`, Expo Go).
2. Cloud build commands for standalone APK using EAS (`eas build -p android --profile preview`).
3. Google Play Store AAB production build commands (`eas build -p android --profile production`).
4. Local native Android build commands (`npx expo run:android`).

## Outcome

- ✅ Impact: Clear and actionable commands delivered to the user for running and generating APK builds for all 3 Expo React Native mobile apps.
- 🧪 Tests: None required (documentation and explainer guidance).
- 📁 Files: Referenced package.json and eas.json in apps/customer-mobile, apps/seller-mobile, apps/admin-mobile.
- 🔁 Next prompts: None.
- 🧠 Reflection: All 3 apps are already configured with EAS preview profiles targeting direct APK builds and pointing to the updated Vercel backend.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
