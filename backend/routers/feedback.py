from fastapi import APIRouter
from pydantic import BaseModel
from database.mongo_client import get_db

router = APIRouter(prefix="/feedback", tags=["Feedback"])

class FeedbackRequest(BaseModel):
    session_id: str
    skill: str

@router.get("/score/{session_id}")
async def get_score(session_id: str):
    db = get_db()
    
    session = db["sessions"].find_one(
        {"session_id": session_id},
        {"_id": 0}
    )
    
    if not session:
        return {"error": "Session not found"}
    
    answers = list(db["answers"].find(
        {"session_id": session_id},
        {"_id": 0}
    ))
    
    total = len(answers)
    scored = sum(a.get("score", 0) for a in answers)
    percentage = (scored / (total * 10) * 100) if total > 0 else 0
    
    return {
        "session_id": session_id,
        "skill": session.get("skill"),
        "total_questions": total,
        "total_score": scored,
        "percentage": round(percentage, 2),
        "answers": answers
    }