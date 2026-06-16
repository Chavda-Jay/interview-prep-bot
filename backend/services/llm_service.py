from groq import Groq
import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent.parent / "config" / ".env"
load_dotenv(dotenv_path=env_path)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

def generate_question(skill: str, level: str, asked_questions: list = []):
    asked = "\n".join(asked_questions) if asked_questions else "None"
    prompt = f"""You are an expert technical interviewer.
Generate ONE interview question for:
- Skill: {skill}
- Level: {level}
- Already asked: {asked}

Return ONLY the question, nothing else."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip()

def evaluate_answer(question: str, answer: str, skill: str):
    prompt = f"""You are an expert technical interviewer.

Question: {question}
Candidate Answer: {answer}
Skill: {skill}

Return in EXACT format:
SCORE: [1-10]
FEEDBACK: [2-3 sentences]
CORRECT_ANSWER: [ideal answer]
WEAK_AREAS: [topics, comma separated]"""

    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": prompt}]
    )
    return parse_evaluation(response.choices[0].message.content.strip())

def parse_evaluation(text: str):
    lines = text.split('\n')
    result = {
        "score": 5,
        "feedback": "",
        "correct_answer": "",
        "weak_areas": []
    }
    for line in lines:
        if line.startswith("SCORE:"):
            try:
                result["score"] = int(line.replace("SCORE:", "").strip())
            except:
                result["score"] = 5
        elif line.startswith("FEEDBACK:"):
            result["feedback"] = line.replace("FEEDBACK:", "").strip()
        elif line.startswith("CORRECT_ANSWER:"):
            result["correct_answer"] = line.replace("CORRECT_ANSWER:", "").strip()
        elif line.startswith("WEAK_AREAS:"):
            areas = line.replace("WEAK_AREAS:", "").strip()
            result["weak_areas"] = [a.strip() for a in areas.split(",")]
    return result