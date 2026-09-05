---
id: "082"
title: "Provide APK Build Commands for Seller and Admin Apps"
stage: misc
date: 2026-09-05
surface: agent
model: gemini-3.8-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "ok ab is ka apk build karnay ki command do"
labels: ["apk-build", "eas-build", "seller-mobile", "admin-mobile", "expo"]
links: null
files: []
tests:
 - Verified eas-cli availability (eas-cli 23.0.0 detected)
 - Verified eas.json buildType "apk" configuration across apps/seller-mobile and apps/admin-mobile
---

# Accomplishments

1. **Verified APK Build Configuration**:
   - Confirmed `eas.json` has `buildType: "apk"` configured under both `preview` and `production` profiles for all mobile applications.
   - Verified that `npx eas-cli` is functional.

2. **Provided Clear APK Build Instructions**:
   - Provided exact terminal commands for building APKs via EAS Cloud Build and optional local build.
