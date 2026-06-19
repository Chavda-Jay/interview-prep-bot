from fastapi import APIRouter
from pydantic import BaseModel
from database.mongo_client import get_db
from services.llm_service import generate_final_report

router = APIRouter(prefix="/feedback", tags=["Feedback"])


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