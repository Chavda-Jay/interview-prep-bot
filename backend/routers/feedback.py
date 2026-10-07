from fastapi import APIRouter, Response
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from database.mongo_client import get_db
from services.llm_service import generate_final_report
import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Preformatted, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

router = APIRouter(prefix="/feedback", tags=["Feedback"])

class ReviewSubmit(BaseModel):
    session_id: str
    rating: int
    comment: Optional[str] = ""

@router.get("/score/{session_id}")
def get_score(session_id: str):
    db = get_db()
    session = db["sessions"].find_one({"session_id": session_id}, {"_id": 0})
    if not session:
        return {"error": "Session not found"}

    answers = list(db["answers"].find({"session_id": session_id}, {"_id": 0}))

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
def submit_review(review: ReviewSubmit):
    db = get_db()
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

@router.get("/report/{session_id}")
def download_report(session_id: str):
    db = get_db()
    session = db["sessions"].find_one({"session_id": session_id}, {"_id": 0})
    if not session:
        return {"error": "Session not found"}

    answers = list(db["answers"].find({"session_id": session_id}, {"_id": 0}))
    
    # Check if report already cached in DB, else generate it
    # We will just generate it here for the PDF content to ensure fresh data
    report = generate_final_report(
        answers=answers,
        skill=session.get("skill", ""),
        level=session.get("level", "beginner"),
        user_name=session.get("user_name", "Candidate"),
    )
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor("#8b5cf6"), spaceAfter=20, alignment=1)
    heading_style = ParagraphStyle('HeadingStyle', parent=styles['Heading2'], fontSize=16, textColor=colors.HexColor("#06b6d4"), spaceBefore=15, spaceAfter=10)
    normal_style = styles["Normal"]
    normal_style.fontSize = 11
    normal_style.leading = 14
    bold_style = ParagraphStyle('BoldStyle', parent=normal_style, fontName='Helvetica-Bold')

    # Title
    story.append(Paragraph(f"AI Interview Performance Report", title_style))
    story.append(Spacer(1, 0.2*inch))

    # Candidate Info
    user_name = session.get("user_name", "Candidate")
    date_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    skill = session.get("skill", "N/A")
    level = session.get("level", "N/A").capitalize()
    overall = report.get("overall_percentage", 0)

    info_data = [
        [Paragraph("<b>Candidate Name:</b>", normal_style), Paragraph(user_name, normal_style)],
        [Paragraph("<b>Date:</b>", normal_style), Paragraph(date_str, normal_style)],
        [Paragraph("<b>Skill:</b>", normal_style), Paragraph(skill, normal_style)],
        [Paragraph("<b>Level:</b>", normal_style), Paragraph(level, normal_style)],
        [Paragraph("<b>Overall Score:</b>", normal_style), Paragraph(f"<b>{overall}%</b>", normal_style)]
    ]
    info_table = Table(info_data, colWidths=[2*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.3*inch))

    # Category Scores
    if report.get("has_tech") and report.get("category_scores"):
        story.append(Paragraph("Technical Category Performance", heading_style))
        cat_data = [["Category", "Score (%)"]]
        for k, v in report["category_scores"].items():
            cat_name = k.replace("_", " ").title()
            cat_data.append([cat_name, str(v)])
        
        cat_table = Table(cat_data, colWidths=[3*inch, 2*inch])
        cat_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#06b6d4")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
            ('PADDING', (0,0), (-1,-1), 8),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ]))
        story.append(cat_table)
        story.append(Spacer(1, 0.3*inch))

    if report.get("has_hr") and report.get("hr_scores"):
        story.append(Paragraph("HR / Behavioral STAR Breakdown", heading_style))
        hr_data = [["Category", "Score (%)"]]
        for k, v in report["hr_scores"].items():
            hr_name = k.title()
            if k == "situation": hr_name = "Situation (S)"
            if k == "task": hr_name = "Task (T)"
            if k == "action": hr_name = "Action (A)"
            if k == "result": hr_name = "Result (R)"
            hr_data.append([hr_name, str(v)])
        
        hr_table = Table(hr_data, colWidths=[3*inch, 2*inch])
        hr_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#8b5cf6")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
            ('PADDING', (0,0), (-1,-1), 8),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ]))
        story.append(hr_table)
        story.append(Spacer(1, 0.3*inch))

    # Strengths and Weaknesses
    story.append(Paragraph("Top Strengths", heading_style))
    for s in report.get("strengths", []):
        story.append(Paragraph(f"• {s}", normal_style))
        
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("Areas for Improvement", heading_style))
    for w in report.get("areas_to_improve", []):
        story.append(Paragraph(f"• {w}", normal_style))
        
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("Recommended Topics", heading_style))
    for r in report.get("recommended_topics", []):
        story.append(Paragraph(f"• {r}", normal_style))
        
    story.append(PageBreak())

    # Question Breakdown
    story.append(Paragraph("Detailed Question Breakdown", title_style))
    
    for i, ans in enumerate(answers):
        story.append(Paragraph(f"Question {i+1}:", bold_style))
        story.append(Spacer(1, 0.05*inch))
        story.append(Paragraph(ans.get("question", ""), normal_style))
        story.append(Spacer(1, 0.1*inch))
        
        user_ans = ans.get("user_answer", ans.get("selected", "No answer"))
        story.append(Paragraph("<b>Your Answer:</b>", normal_style))
        story.append(Paragraph(user_ans, normal_style))
        story.append(Spacer(1, 0.1*inch))
        
        if ans.get("correct_answer"):
            story.append(Paragraph("<b>Ideal Answer:</b>", normal_style))
            story.append(Paragraph(ans.get("correct_answer", ""), normal_style))
            story.append(Spacer(1, 0.1*inch))
            
        story.append(Paragraph(f"<b>Score:</b> {ans.get('score', 0)}/10", normal_style))
        story.append(Spacer(1, 0.1*inch))

        if ans.get("question_type") == "hr":
            story.append(Paragraph(f"<b>STAR:</b> S:{ans.get('situation',0)}/10 | T:{ans.get('task',0)}/10 | A:{ans.get('action',0)}/10 | R:{ans.get('result',0)}/10", normal_style))
            story.append(Spacer(1, 0.1*inch))
            if ans.get("missing"):
                story.append(Paragraph(f"<b>Missing:</b> {ans.get('missing')}", normal_style))
                story.append(Spacer(1, 0.1*inch))
            if ans.get("tip"):
                story.append(Paragraph(f"<b>Tip:</b> {ans.get('tip')}", normal_style))
                story.append(Spacer(1, 0.1*inch))
        
        story.append(Paragraph("<b>AI Feedback:</b>", normal_style))
        story.append(Paragraph(ans.get("feedback", ""), normal_style))
        story.append(Spacer(1, 0.3*inch))
        
    doc.build(story)
    buffer.seek(0)
    
    filename = f"Interview_Report_{user_name.replace(' ', '_')}_{session_id[:6]}.pdf"
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/analytics/{user_name}")
def get_analytics(user_name: str):
    db = get_db()
    sessions = list(db["sessions"].find({"user_name": user_name, "status": "completed"}).sort("ended_at", -1))
    
    if not sessions:
        return {
            "total_sessions": 0, "best_score": 0, "average_score": 0, "streak_days": 0,
            "skill_performance": {}, "category_averages": {}, "weak_areas": [],
            "recent_sessions": [], "progress_data": [], "achievements": []
        }
        
    total_sessions = len(sessions)
    session_ids = [s["session_id"] for s in sessions]
    answers = list(db["answers"].find({"session_id": {"$in": session_ids}}))
    
    best_score = 0
    total_percentage_sum = 0
    progress_data = []
    recent_sessions = []
    
    # Calculate session level stats
    for s in reversed(sessions): # Chronological for progress
        total_q = s.get("total_questions", 15)
        score = s.get("score", 0)
        max_possible = total_q * 10
        pct = round((score / max_possible * 100)) if max_possible > 0 else 0
        progress_data.append(pct)
        
        if pct > best_score:
            best_score = pct
        total_percentage_sum += pct
        
    for s in sessions[:5]:
        total_q = s.get("total_questions", 15)
        score = s.get("score", 0)
        max_possible = total_q * 10
        pct = round((score / max_possible * 100)) if max_possible > 0 else 0
        
        ended_at = s.get("ended_at")
        date_str = ended_at.strftime("%Y-%m-%d") if isinstance(ended_at, datetime) else datetime.utcnow().strftime("%Y-%m-%d")
        
        recent_sessions.append({
            "date": date_str,
            "skill": s.get("skill", "N/A"),
            "level": s.get("level", "N/A"),
            "score": pct,
            "type": "HR" if s.get("session_type") == "hr" else "Technical"
        })
        
    average_score = round(total_percentage_sum / total_sessions)
    
    # Calculate streak
    streak_days = 0
    if sessions:
        import datetime as dt
        dates = []
        for s in sessions:
            ended = s.get("ended_at")
            if isinstance(ended, datetime):
                dates.append(ended.date())
        
        dates = sorted(list(set(dates)), reverse=True)
        today = dt.datetime.utcnow().date()
        if dates and (today - dates[0]).days <= 1:
            streak_days = 1
            for i in range(1, len(dates)):
                if (dates[i-1] - dates[i]).days == 1:
                    streak_days += 1
                else:
                    break
    
    # Skill performance
    skill_perf = {}
    skill_counts = {}
    for s in sessions:
        skill = s.get("skill", "N/A")
        total_q = s.get("total_questions", 15)
        score = s.get("score", 0)
        max_possible = total_q * 10
        pct = (score / max_possible * 100) if max_possible > 0 else 0
        
        skill_perf[skill] = skill_perf.get(skill, 0) + pct
        skill_counts[skill] = skill_counts.get(skill, 0) + 1
        
    for k in skill_perf:
        skill_perf[k] = round(skill_perf[k] / skill_counts[k])
        
    # Category averages
    categories = ["technical_knowledge", "concept_understanding", "problem_solving", "communication", "confidence", "clarity"]
    cat_sums = {c: 0 for c in categories}
    cat_counts = {c: 0 for c in categories}
    weak_counts = {}
    
    for a in answers:
        for c in categories:
            if c in a and isinstance(a[c], (int, float)):
                cat_sums[c] += a[c]
                cat_counts[c] += 1
        
        for w in a.get("weak_areas", []):
            if w:
                weak_counts[w] = weak_counts.get(w, 0) + 1
                
    category_averages = {}
    for c in categories:
        if cat_counts[c] > 0:
            category_averages[c] = round((cat_sums[c] / cat_counts[c]) * 10) # 0-10 -> 0-100%
            
    # Weak areas sorted
    sorted_weak = sorted([{"topic": k, "count": v} for k, v in weak_counts.items()], key=lambda x: x["count"], reverse=True)[:5]
    
    # Achievements
    achievements = []
    if total_sessions >= 1: achievements.append("🔥 First Interview")
    if best_score >= 90: achievements.append("⭐ High Scorer")
    if total_sessions >= 5: achievements.append("💪 Consistent")
    
    # Improver (last 3 scores increasing)
    if len(progress_data) >= 3:
        if progress_data[-1] > progress_data[-2] > progress_data[-3]:
            achievements.append("📈 Improver")
            
    if any(score >= 80 for score in skill_perf.values()):
        achievements.append("🎯 Skill Master")
        
    return {
        "total_sessions": total_sessions,
        "best_score": best_score,
        "average_score": average_score,
        "streak_days": streak_days,
        "skill_performance": skill_perf,
        "category_averages": category_averages,
        "weak_areas": sorted_weak,
        "recent_sessions": recent_sessions,
        "progress_data": progress_data[-10:], # last 10
        "achievements": achievements
    }