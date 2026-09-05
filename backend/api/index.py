import os
import sys
import traceback

# Ensure backend root is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from src.main import app
except Exception as e:
    tb = traceback.format_exc()
    print("FATAL ERROR ON VERCEL STARTUP:\n", tb)
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    from fastapi.middleware.cors import CORSMiddleware
    app = FastAPI(title="AI Plaza API Error Fallback")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"])
    async def catch_all(path: str = ""):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Vercel Startup Error",
                "detail": str(e),
                "traceback": tb.splitlines()
            }
        )

handler = app

