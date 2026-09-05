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
    ],
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


