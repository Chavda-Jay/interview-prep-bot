from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.mongo_client import get_db
import uuid
from datetime import datetime

router = APIRouter(prefix="/interview", tags=["Interview"])

# Request Models
class StartInterviewRequest(BaseModel):
    user_name: str
    skill: str  # React, Python, Java etc.
    level: str  # beginner, intermediate, advanced

class SubmitAnswerRequest(BaseModel):
    session_id: str
    question_id: str
    question: str
    user_answer: str

# Start Interview
@router.post("/start")
async def start_interview(request: StartInterviewRequest):
    db = get_db()
    
    session = {
        "session_id": str(uuid.uuid4()),
        "user_name": request.user_name,
        "skill": request.skill,
        "level": request.level,
        "started_at": datetime.utcnow(),
        "status": "active",
        "questions_asked": [],
        "score": 0
    }
    
    db["sessions"].insert_one(session)
    
    return {
        "session_id": session["session_id"],
        "message": f"Interview started for {request.skill}!",
        "skill": request.skill,
        "level": request.level
    }

# Get Session
@router.get("/session/{session_id}")
async def get_session(session_id: str):
    db = get_db()
    session = db["sessions"].find_one(
        {"session_id": session_id},
        {"_id": 0}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

# End Interview
@router.post("/end/{session_id}")
async def end_interview(session_id: str):
    db = get_db()
    db["sessions"].update_one(
        {"session_id": session_id},
        {"$set": {"status": "completed", "ended_at": datetime.utcnow()}}
    )
    return {"message": "Interview completed!", "session_id": session_id}