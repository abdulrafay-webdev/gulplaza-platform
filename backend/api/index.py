import os
import sys
import traceback
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend root is in python path
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

app = FastAPI(title="AI Plaza API Router")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://gulplaza-frontend.vercel.app",
        "https://gulplaza-platform-frontend.vercel.app",
        "https://gulplaza-platform.vercel.app",
        "https://gulplaza-platform-backend.vercel.app",
    ],
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import re
from urllib.parse import parse_qs, urlencode

@app.middleware("http")
async def vercel_path_resolver(request: Request, call_next):
    raw_qs = request.scope.get("query_string", b"").decode("utf-8", errors="ignore")
    target_path = None

    # 1. Primary: Extract __path injected by vercel.json rewrite rule
    if "__path" in raw_qs:
        qs_dict = parse_qs(raw_qs, keep_blank_values=True)
        if "__path" in qs_dict:
            target_path = qs_dict.pop("__path")[0]
            pairs = [(k, v) for k, vals in qs_dict.items() for v in vals]
            request.scope["query_string"] = urlencode(pairs).encode("utf-8")

    # 2. Fallback: Check headers
    if not target_path:
        matched_path = request.headers.get("x-matched-path")
        if matched_path:
            clean_path = matched_path.split("?")[0]
            if clean_path not in ("/api/index.py", "/api/index", "/api"):
                target_path = clean_path

    # 3. Fallback: Check forwarded uri
    if not target_path and request.scope.get("path") in ("/api/index.py", "/api/index", "/api"):
        forwarded = request.headers.get("x-forwarded-uri") or request.headers.get("x-original-uri")
        if forwarded:
            clean_fwd = forwarded.split("?")[0]
            if clean_fwd not in ("/api/index.py", "/api/index", "/api"):
                target_path = clean_fwd

    # Apply resolved target path
    if target_path:
        target_path = re.sub(r"/+", "/", target_path)
        if not target_path.startswith("/"):
            target_path = "/" + target_path
        request.scope["path"] = target_path

    return await call_next(request)

# Attempt importing main application
main_app = None
import_error = None

try:
    from src.main import app as main_app
except Exception as e:
    import_error = {
        "error": str(e),
        "traceback": traceback.format_exc().splitlines(),
        "backend_root": backend_root,
        "files_in_backend": os.listdir(backend_root) if os.path.exists(backend_root) else [],
    }
    print("FATAL STARTUP IMPORT ERROR:\n", traceback.format_exc())

@app.get("/debug-status")
@app.get("/api/index.py")
@app.get("/api/index")
@app.get("/api")
def debug_status():
    return {
        "status": "alive",
        "has_main_app": main_app is not None,
        "import_error": import_error,
        "backend_root": backend_root,
    }

if main_app:
    app.mount("/", main_app)
else:
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"])
    async def catch_all(request: Request, path: str = ""):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Backend Failed to Start",
                "import_error": import_error,
                "path": path,
            }
        )

handler = app


