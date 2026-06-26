from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from database.mongo_client import get_db
from services.llm_service import (
    generate_mcq_question,
    generate_descriptive_question,
    evaluate_mcq,
    evaluate_descriptive_answer,
    generate_final_report,
    get_question_schedule,
)
import uuid
from datetime import datetime
import random
from services.memory_service import save_user_memory, get_user_memory

router = APIRouter(prefix="/interview", tags=["Interview"])


class StartInterviewRequest(BaseModel):
    user_name: str
    skill: str
    level: str


class SubmitAnswerRequest(BaseModel):
    session_id: str
    question: str
    user_answer: str
    skill: str
    question_type: str  # "mcq" or "descriptive"
    # MCQ-specific fields
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None  # The correct letter (A/B/C/D)


@router.post("/start")
async def start_interview(request: StartInterviewRequest):
    db = get_db()

    # Level ke hisaab se total questions
    total_map = {"beginner": 10, "intermediate": 15, "advanced": 20}
    total_questions = total_map.get(request.level, 10)

    # Unique seed per session
    session_seed = random.randint(1, 999999)

    # Pre-compute the question schedule (mcq/descriptive order)
    question_schedule = get_question_schedule(request.level, session_seed)

    session = {
        "session_id": str(uuid.uuid4()),
        "user_name": request.user_name,
        "skill": request.skill,
        "level": request.level,
        "total_questions": total_questions,
        "session_seed": session_seed,
        "question_schedule": question_schedule,
        "started_at": datetime.utcnow(),
        "status": "active",
        "questions_asked": [],
        "score": 0,
    }
    db["sessions"].insert_one(session)

    # Generate first question based on schedule
    q_type = question_schedule[0]

    if q_type == "mcq":
        mcq_data = generate_mcq_question(request.skill, request.level, [], 1, session_seed)
        question_text = mcq_data["question"]

        db["sessions"].update_one(
            {"session_id": session["session_id"]},
            {"$push": {"questions_asked": question_text}},
        )

        return {
            "session_id": session["session_id"],
            "message": f"Interview started for {request.skill}!",
            "question": question_text,
            "question_type": "mcq",
            "options": mcq_data["options"],
            "correct_answer": mcq_data["correct"],
            "skill": request.skill,
            "level": request.level,
            "total_questions": total_questions,
            "question_number": 1,
        }
    else:
        question_text = generate_descriptive_question(
            request.skill, request.level, [], 1, session_seed
        )

        db["sessions"].update_one(
            {"session_id": session["session_id"]},
            {"$push": {"questions_asked": question_text}},
        )

        return {
            "session_id": session["session_id"],
            "message": f"Interview started for {request.skill}!",
            "question": question_text,
            "question_type": "descriptive",
            "skill": request.skill,
            "level": request.level,
            "total_questions": total_questions,
            "question_number": 1,
        }


@router.post("/next-question")
async def next_question(session_id: str):
    db = get_db()
    session = db["sessions"].find_one({"session_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    question_number = len(session.get("questions_asked", [])) + 1
    session_seed = session.get("session_seed", random.randint(1, 999999))
    schedule = session.get("question_schedule", [])

    # Determine question type from schedule
    if question_number <= len(schedule):
        q_type = schedule[question_number - 1]
    else:
        q_type = "descriptive"  # fallback

    asked = session.get("questions_asked", [])

    if q_type == "mcq":
        mcq_data = generate_mcq_question(
            session["skill"], session["level"], asked, question_number, session_seed
        )
        question_text = mcq_data["question"]

        db["sessions"].update_one(
            {"session_id": session_id},
            {"$push": {"questions_asked": question_text}},
        )

        return {
            "session_id": session_id,
            "question": question_text,
            "question_type": "mcq",
            "options": mcq_data["options"],
            "correct_answer": mcq_data["correct"],
            "question_number": question_number,
        }
    else:
        question_text = generate_descriptive_question(
            session["skill"], session["level"], asked, question_number, session_seed
        )

        db["sessions"].update_one(
            {"session_id": session_id},
            {"$push": {"questions_asked": question_text}},
        )

        return {
            "session_id": session_id,
            "question": question_text,
            "question_type": "descriptive",
            "question_number": question_number,
        }


@router.post("/submit-answer")
async def submit_answer(request: SubmitAnswerRequest):
    db = get_db()

    if request.question_type == "mcq":
        # Auto-evaluate MCQ
        evaluation = evaluate_mcq(
            question=request.question,
            options=request.options or [],
            selected=request.user_answer,
            correct=request.correct_answer or "A",
            skill=request.skill,
        )
    else:
        # AI-evaluate descriptive answer
        evaluation = evaluate_descriptive_answer(
            question=request.question,
            answer=request.user_answer,
            skill=request.skill,
        )

    answer_doc = {
        "session_id": request.session_id,
        "question": request.question,
        "user_answer": request.user_answer,
        "question_type": request.question_type,
        "score": evaluation["score"],
        "feedback": evaluation["feedback"],
        "correct_answer": evaluation.get("correct_answer", ""),
        "weak_areas": evaluation.get("weak_areas", []),
        # Category scores
        "technical_knowledge": evaluation.get("technical_knowledge", 5),
        "concept_understanding": evaluation.get("concept_understanding", 5),
        "problem_solving": evaluation.get("problem_solving", 5),
        "communication": evaluation.get("communication", 5),
        "confidence": evaluation.get("confidence", 5),
        "clarity": evaluation.get("clarity", 5),
        "answered_at": datetime.utcnow(),
    }

    # MCQ-specific fields
    if request.question_type == "mcq":
        answer_doc["options"] = request.options
        answer_doc["selected"] = request.user_answer
        answer_doc["correct"] = request.correct_answer
        answer_doc["is_correct"] = evaluation.get("is_correct", False)

    db["answers"].insert_one(answer_doc)
    db["sessions"].update_one(
        {"session_id": request.session_id}, {"$inc": {"score": evaluation["score"]}}
    )

    return {
        "score": evaluation["score"],
        "feedback": evaluation["feedback"],
        "correct_answer": evaluation.get("correct_answer", ""),
        "weak_areas": evaluation.get("weak_areas", []),
        "is_correct": evaluation.get("is_correct", None),
        "question_type": request.question_type,
        # Category scores
        "technical_knowledge": evaluation.get("technical_knowledge", 5),
        "concept_understanding": evaluation.get("concept_understanding", 5),
        "problem_solving": evaluation.get("problem_solving", 5),
        "communication": evaluation.get("communication", 5),
        "confidence": evaluation.get("confidence", 5),
        "clarity": evaluation.get("clarity", 5),
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
    
    # Session fetch karo
    session = db["sessions"].find_one({"session_id": session_id})
    
    if session:
        # Answers fetch karo
        answers = list(db["answers"].find({"session_id": session_id}))
        
        # Weak areas collect karo
        all_weak = []
        for a in answers:
            for w in a.get("weak_areas", []):
                if w and w not in all_weak:
                    all_weak.append(w)
        
        # Memory save karo
        save_user_memory(
            user_name=session.get("user_name", "Anonymous"),
            skill=session.get("skill", ""),
            level=session.get("level", ""),
            score=session.get("score", 0),
            total=session.get("total_questions", 10),
            weak_areas=all_weak[:5]
        )
    
    db["sessions"].update_one(
        {"session_id": session_id},
        {"$set": {"status": "completed", "ended_at": datetime.utcnow()}}
    )
    return {"message": "Interview completed!", "session_id": session_id}

    
@router.get("/memory/{user_name}")
async def get_memory(user_name: str):
    """User ki memory fetch karo"""
    from services.memory_service import get_user_progress
    progress = get_user_progress(user_name)
    if not progress:
        return {"exists": False}
    return {"exists": True, **progress}
