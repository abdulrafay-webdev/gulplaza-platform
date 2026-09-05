---
id: 085
title: Fix Vercel Function Invocation and CORS Errors
stage: green
date: 2026-09-05
surface: agent
model: inherit
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: yousuf
command: agent
labels: ["cors", "vercel", "fastapi", "pydantic", "serverless", "dependencies"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/api/index.py
  - backend/requirements.txt
  - backend/src/api/products.py
  - backend/src/main.py
  - backend/src/models/product.py
tests:
  - python -m py_compile backend/api/index.py backend/src/main.py backend/src/models/product.py backend/src/api/products.py
  - python TestClient CORS preflight simulation
  - npm run build (next-frontend)
---

### User Prompt
```text
Access to XMLHttpRequest at 'https://gulplaza-platform.vercel.app/api/v1/recent?limit=6' from origin 'https://gulplaza-platform-frontend.vercel.app' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
gulplaza-platform.vercel.app/api/v1/recent?limit=6:1  Failed to load resource: net::ERR_FAILED
(index):1 Access to XMLHttpRequest at 'https://gulplaza-platform.vercel.app/api/v1/shops/' from origin 'https://gulplaza-platform-frontend.vercel.app' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
c43c962551d2d025.js:1 Failed to load home data Y
(anonymous) @ c43c962551d2d025.js:1
gulplaza-platform.vercel.app/api/v1/shops/:1  Failed to load resource: net::ERR_FAILED
(index):1 Access to XMLHttpRequest at 'https://gulplaza-platform.vercel.app/api/v1/auth/me' from origin 'https://gulplaza-platform-frontend.vercel.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
gulplaza-platform.vercel.app/api/v1/auth/me:1  Failed to load resource: net::ERR_FAILED
(index):1 Access to XMLHttpRequest at 'https://gulplaza-platform.vercel.app/api/v1/products?limit=50' from origin 'https://gulplaza-platform-frontend.vercel.app' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
gulplaza-platform.vercel.app/api/v1/products?limit=50:1  Failed to load resource: net::ERR_FAILED
```

### Assistant Response
Diagnosed root cause:
1. `backend/requirements.txt` included `clerk-sdk-python`, an unused legacy package that pinned `pydantic<2.0.0` (Pydantic v1) during pip installation on Vercel.
2. In the prior commit, `from pydantic import field_validator` was added to `product.py` and `api/products.py`. In Pydantic v1, `field_validator` does not exist, triggering an unhandled `ImportError: cannot import name 'field_validator' from 'pydantic'` during serverless module load on Vercel.
3. The import crash caused Vercel to emit `HTTP 500 FUNCTION_INVOCATION_FAILED`. Because the error was returned by Vercel's edge proxy rather than FastAPI, it carried no CORS headers, causing the browser to block all API requests with CORS failure notices.
4. In `backend/src/main.py`, the lifespan hook was running blocking DDL table migrations (`init_db()`) on serverless cold starts, adding 10-15s network latency.

Resolved:
- Removed unused `clerk-sdk-python` from `backend/requirements.txt` so modern Pydantic v2 installs cleanly.
- Implemented universal compatibility helper `validator_before` in `backend/src/models/product.py` and `backend/src/api/products.py` so validation decorators function seamlessly under both Pydantic v1 and v2.
- Added explicit origins `"https://gulplaza-platform-frontend.vercel.app"` and `"https://gulplaza-platform.vercel.app"` to CORS configuration in `backend/src/main.py`, and updated regex to `^https://.*\.vercel\.app$`.
- Prevented cold-start blocking in `backend/src/main.py` by gating `init_db()` behind `RUN_DB_INIT`.
- Wrapped `backend/api/index.py` in a pure ASGI fallback handler that catches startup exceptions and always emits JSON responses with full CORS headers.
- Validated with Next.js production build (`npm run build`) and Python TestClient preflight checks.
