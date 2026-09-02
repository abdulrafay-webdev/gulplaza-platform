---
id: "073"
title: "Fix Web Admin Login Page Rendering in AdminLayout"
stage: green
date: 2026-09-02
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "Super Admin Authentication Required Please authenticate with your Super Admin credentials to access platform controls. Sign In to Admin Console  jab web per super admin panel per login kar raha houn tou ye araha hay email password wagera ka option nhi araha mobile per perfectly login horaha hay sirf is issue ko solve karo or koi cheez ko mat change karna"
labels: ["admin-web", "admin-login", "layout-bypass", "bug-fix"]
links: null
files:
 - next-frontend/src/app/admin/layout.tsx
tests:
 - Next.js production build verified (27/27 static & dynamic pages compiled with 0 errors)
---

# Accomplishments

1. **Fixed Web Super Admin Login Screen Rendering**:
   - Identified that `next-frontend/src/app/admin/layout.tsx` wrapped all `/admin/*` routes (including `/admin/login`). When an unauthenticated user visited `/admin/login`, the layout intercepted the route and displayed a static prompt "Super Admin Authentication Required" with a "Sign In to Admin Console" link pointing back to `/admin/login`, completely hiding the login form (`next-frontend/src/app/admin/login/page.tsx`).
   - Added an `isLoginPage` check (`pathname === "/admin/login"`) in `AdminLayout` to render `<>{children}</>` directly without blocking the user or triggering redirect loops.
   - Preserved all other functionality and files as strictly instructed.
