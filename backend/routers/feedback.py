from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from database.mongo_client import get_db
from services.llm_service import generate_final_report

router = APIRouter(prefix="/feedback", tags=["Feedback"])

class ReviewSubmit(BaseModel):
    session_id: str
    rating: int
    comment: Optional[str] = ""


@router.get("/score/{session_id}")
async def get_score(session_id: str):
    db = get_db()

    session = db["sessions"].find_one({"session_id": session_id}, {"_id": 0})

    if not session:
        return {"error": "Session not found"}

    answers = list(db["answers"].find({"session_id": session_id}, {"_id": 0}))

    # Generate comprehensive report
    report = generate_final_report(
        answers=answers,
        skill=session.get("skill", ""),
        level=session.get("level", "beginner"),
        user_name=session.get("user_name", "Candidate"),
    )

    return {
        "session_id": session_id,
        **report,
    }


@router.post("/submit_review")
async def submit_review(review: ReviewSubmit):
    db = get_db()
    
    # Get session details to link the review
    session = db["sessions"].find_one({"session_id": review.session_id}, {"_id": 0})
    user_name = session.get("user_name", "Unknown") if session else "Unknown"
    
    review_data = {
        "session_id": review.session_id,
        "user_name": user_name,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": datetime.utcnow()
    }
    
    db["user_reviews"].insert_one(review_data)
    
    return {"message": "Thank you for your feedback!", "success": True}