from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.mongo_client import get_db
from services.llm_service import generate_question, evaluate_answer
import uuid
from datetime import datetime

router = APIRouter(prefix="/interview", tags=["Interview"])

class StartInterviewRequest(BaseModel):
    user_name: str
    skill: str
    level: str

class SubmitAnswerRequest(BaseModel):
    session_id: str
    question: str
    user_answer: str

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
    
    # Pehla question generate karo
    question = generate_question(request.skill, request.level)
    
    db["sessions"].update_one(
        {"session_id": session["session_id"]},
        {"$push": {"questions_asked": question}}
    )
    
    return {
        "session_id": session["session_id"],
        "message": f"Interview started for {request.skill}!",
        "question": question,
        "skill": request.skill,
        "level": request.level
    }

@router.post("/next-question")
async def next_question(session_id: str):
    db = get_db()
    session = db["sessions"].find_one({"session_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    question = generate_question(
        session["skill"],
        session["level"],
        session.get("questions_asked", [])
    )
    
    db["sessions"].update_one(
        {"session_id": session_id},
        {"$push": {"questions_asked": question}}
    )
    
    return {"session_id": session_id, "question": question}

@router.post("/submit-answer")
async def submit_answer(request: SubmitAnswerRequest):
    db = get_db()
    
    evaluation = evaluate_answer(
        request.question,
        request.user_answer,
        "general"
    )
    
    answer_doc = {
        "session_id": request.session_id,
        "question": request.question,
        "user_answer": request.user_answer,
        "score": evaluation["score"],
        "feedback": evaluation["feedback"],
        "correct_answer": evaluation["correct_answer"],
        "weak_areas": evaluation["weak_areas"],
        "answered_at": datetime.utcnow()
    }
    
    db["answers"].insert_one(answer_doc)
    db["sessions"].update_one(
        {"session_id": request.session_id},
        {"$inc": {"score": evaluation["score"]}}
    )
    
    return {
        "score": evaluation["score"],
        "feedback": evaluation["feedback"],
        "correct_answer": evaluation["correct_answer"],
        "weak_areas": evaluation["weak_areas"]
    }

@router.get("/session/{session_id}")
async def get_session(session_id: str):
    db = get_db()
    session = db["sessions"].find_one({"session_id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.post("/end/{session_id}")
async def end_interview(session_id: str):
    db = get_db()
    db["sessions"].update_one(
        {"session_id": session_id},
        {"$set": {"status": "completed", "ended_at": datetime.utcnow()}}
    )
    return {"message": "Interview completed!", "session_id": session_id}