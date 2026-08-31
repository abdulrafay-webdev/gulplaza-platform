---
id: "066"
title: "Remove Stale EAS Project ID from Seller Mobile App Configuration"
stage: green
date: 2026-08-31
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "Removed stale hardcoded eas.projectId from seller-mobile app.json so EAS build can automatically link the user's active Expo project account"
labels: ["seller-mobile", "eas-build", "expo-configuration", "project-id-link"]
links: null
files:
 - apps/seller-mobile/app.json
tests:
 - Git push and repository synchronization verified
---

# Accomplishments

1. **Resolved EAS Build Error**:
   - `app.json` in `apps/seller-mobile` had an obsolete `extra.eas.projectId` (`8b584eb2-3024-4f27-a066-e82eb0aaec04`) which didn't exist in the user's Expo account, causing `Experience with id does not exist. Error: GraphQL request failed.`
   - Removed the stale ID so EAS CLI can automatically initialize and link to the user's account upon running `eas build`.
