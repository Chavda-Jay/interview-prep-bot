from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.mongo_client import connect_db
from routers import interview, feedback

app = FastAPI(title="Interview Prep Bot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(interview.router)
app.include_router(feedback.router)

@app.on_event("startup")
async def startup_event():
    connect_db()

@app.get("/")
def root():
    return {"message": "Interview Prep Bot is running! 🚀"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}