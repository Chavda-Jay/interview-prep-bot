from database.mongo_client import get_db
from datetime import datetime

def save_user_memory(user_name: str, skill: str, level: str, 
                     score: int, total: int, weak_areas: list):
    """User ka session memory save karo"""
    db = get_db()
    percentage = round((score / (total * 10)) * 100) if total > 0 else 0
    
    # Check karo user exist karta hai ya nahi
    existing = db["user_memory"].find_one({"user_name": user_name})
    
    session_record = {
        "skill": skill,
        "level": level,
        "score": score,
        "percentage": percentage,
        "weak_areas": weak_areas,
        "date": datetime.utcnow()
    }
    
    if existing:
        # Update existing user
        all_weak = existing.get("all_weak_areas", [])
        for w in weak_areas:
            if w and w not in all_weak:
                all_weak.append(w)
        
        sessions = existing.get("sessions", [])
        sessions.append(session_record)
        
        db["user_memory"].update_one(
            {"user_name": user_name},
            {"$set": {
                "last_skill": skill,
                "last_level": level,
                "last_percentage": percentage,
                "last_session": datetime.utcnow(),
                "all_weak_areas": all_weak[-5:],  # Last 5 weak areas
                "sessions": sessions[-10:],  # Last 10 sessions
                "total_sessions": len(sessions),
                "best_score": max(existing.get("best_score", 0), percentage),
            }}
        )
    else:
        # New user banao
        db["user_memory"].insert_one({
            "user_name": user_name,
            "last_skill": skill,
            "last_level": level,
            "last_percentage": percentage,
            "last_session": datetime.utcnow(),
            "all_weak_areas": weak_areas[:5],
            "sessions": [session_record],
            "total_sessions": 1,
            "best_score": percentage,
            "created_at": datetime.utcnow()
        })

def get_user_memory(user_name: str):
    """User ki memory fetch karo"""
    db = get_db()
    memory = db["user_memory"].find_one(
        {"user_name": user_name},
        {"_id": 0}
    )
    return memory

def get_user_progress(user_name: str):
    """User ka progress calculate karo"""
    memory = get_user_memory(user_name)
    if not memory:
        return None
    
    sessions = memory.get("sessions", [])
    if len(sessions) < 2:
        trend = "new"
    else:
        last = sessions[-1]["percentage"]
        prev = sessions[-2]["percentage"]
        if last > prev:
            trend = "improving"
        elif last < prev:
            trend = "declining"
        else:
            trend = "stable"
    
    return {
        "user_name": user_name,
        "total_sessions": memory.get("total_sessions", 0),
        "last_skill": memory.get("last_skill"),
        "last_percentage": memory.get("last_percentage", 0),
        "best_score": memory.get("best_score", 0),
        "weak_areas": memory.get("all_weak_areas", []),
        "trend": trend,
        "sessions": sessions[-5:],  # Last 5 sessions
    }