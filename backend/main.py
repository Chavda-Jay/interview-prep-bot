from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.mongo_client import connect_db
from routers import interview, feedback, auth

app = FastAPI(title="Interview Prep Bot API", version="1.0.0")

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


@app.on_event("startup")
async def startup_event():
    connect_db()

@app.get("/")
def root():
    return {"message": "Interview Prep Bot is running! 🚀"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
