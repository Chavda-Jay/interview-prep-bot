from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
import logging
import time
import asyncio
from collections import defaultdict
from fastapi import Request
from fastapi.responses import JSONResponse

# Configure logging so email errors show up in Render logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.mongo_client import connect_db
from routers import interview, feedback, auth

app = FastAPI(title="Interview Prep Bot API", version="1.0.0")

# Simple In-Memory Rate Limiter (100 requests per minute per IP)
request_counts = defaultdict(lambda: {"count": 0, "reset_time": time.time() + 60})

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    if now > request_counts[client_ip]["reset_time"]:
        request_counts[client_ip] = {"count": 1, "reset_time": now + 60}
    else:
        request_counts[client_ip]["count"] += 1
        if request_counts[client_ip]["count"] > 100:
            return JSONResponse(status_code=429, content={"detail": "Too Many Requests"})
            
    return await call_next(request)

# Build allowed origins list — includes local dev + production frontend
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
# Add production frontend URL from env var (set on Render)
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(interview.router)
app.include_router(feedback.router)
app.include_router(auth.router)


async def email_worker(queue: asyncio.Queue):
    while True:
        try:
            func, args = await queue.get()
            await asyncio.to_thread(func, *args)
            queue.task_done()
        except Exception as e:
            logging.error(f"Background email worker error: {e}")

@app.on_event("startup")
async def startup_event():
    connect_db()
    app.state.email_queue = asyncio.Queue()
    asyncio.create_task(email_worker(app.state.email_queue))

@app.get("/")
def root():
    return {"message": "Interview Prep Bot is running! 🚀"}

@app.get("/health")
def health_check():
    email_configured = bool(os.getenv("EMAIL_SENDER")) and bool(os.getenv("EMAIL_PASSWORD"))
    return {
        "status": "healthy",
        "email_configured": email_configured,
    }

