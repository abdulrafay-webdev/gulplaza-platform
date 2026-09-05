import os
import sys
import traceback

# Ensure backend root is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from src.main import app
    handler = app
except Exception as e:
    tb = traceback.format_exc()
    print("FATAL ERROR ON VERCEL STARTUP:\n", tb)
    
    async def handler(scope, receive, send):
        if scope["type"] == "http":
            body = (
                f'{{"error": "Vercel Startup Error", "detail": "{str(e)}", "traceback": {repr(tb.splitlines())}}}'
            ).encode("utf-8")
            await send({
                "type": "http.response.start",
                "status": 500,
                "headers": [
                    (b"content-type", b"application/json"),
                    (b"access-control-allow-origin", b"*"),
                    (b"access-control-allow-methods", b"*"),
                    (b"access-control-allow-headers", b"*"),
                ],
            })
            await send({
                "type": "http.response.body",
                "body": body,
            })

