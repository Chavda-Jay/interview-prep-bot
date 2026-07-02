
# InterviewAI - AI-Powered Interview Practice Bot
## Project Documentation & Workflow

### 1. Project Overview
InterviewAI is a full-stack web application designed to help users prepare for technical interviews. It simulates real-world interviews using Artificial Intelligence, providing real-time feedback, scoring, and personalized questions based on the user's selected technology stack and experience level.

### 2. Technology Stack
The project is divided into a frontend and a backend, built with modern web technologies:

**Frontend:**
- **React.js & Vite:** Used for building a fast, dynamic, and responsive user interface.
- **CSS (Vanilla):** Custom styling with a modern dark-mode aesthetic, glassmorphism, and smooth animations.
- **Axios:** For making API requests to the backend.

**Backend:**
- **FastAPI:** A modern, high-performance web framework for building APIs with Python.
- **Uvicorn:** ASGI web server implementation for running FastAPI.
- **Python:** The core backend programming language.

### 3. AI & External APIs Used
- **LLM Provider:** Groq API
- **AI Model:** `llama-3.3-70b-versatile`
- **Why Groq?** Groq provides blazing-fast inference speeds for Llama models, making the real-time interview experience seamless and reducing latency between questions and answers.

### 4. Supported Technologies (Skills)
The bot currently supports 6 highly-demanded skills for interviews:
1. **Python** (Backend / Data Science)
2. **React** (Frontend)
3. **JavaScript** (Web Development)
4. **Java** (Enterprise Backend)
5. **Node.js** (Backend)
6. **SQL** (Databases)

### 5. Experience Levels
The questions adapt based on the user's selected experience level:
- **Beginner:** Focuses on foundational concepts and syntax (0-1 years).
- **Intermediate:** Focuses on practical, scenario-based problem solving (2-4 years).
- **Advanced:** Focuses on system design, architecture, and edge cases (5+ years).

---

### 6. System Workflow (How it Works)

**Step 1: User Onboarding**
- The user enters their name, selects a skill (e.g., React), and chooses a difficulty level (e.g., Intermediate).
- The frontend sends a request to the backend to start a new interview session.

**Step 2: Question Generation (Dynamic)**
- The backend uses the `llm_service.py` to generate questions dynamically.
- A pre-defined pool of topics is shuffled, and the `llama-3.3-70b-versatile` model is prompted to generate a unique, highly relevant interview question (either Multiple Choice or Descriptive) based on the topic and difficulty level.
- The generated question is sent back to the frontend.

**Step 3: User Interaction**
- The user reads the question and submits their answer (selecting an MCQ option or typing a descriptive answer).

**Step 4: AI Evaluation & Feedback**
- For **MCQs**: The backend instantly checks if the answer is correct and assigns a score.
- For **Descriptive**: The backend sends the user's answer back to the Groq API. The AI evaluates the answer across 6 criteria:
  1. Technical Knowledge
  2. Concept Understanding
  3. Problem Solving
  4. Communication
  5. Confidence
  6. Clarity
- The AI provides a score (out of 10), constructive feedback, the ideal correct answer, and identifies weak areas.

**Step 5: Final Assessment Report**
- After completing all questions (e.g., 10 questions), the backend aggregates all scores.
- A final comprehensive report is generated highlighting the user's overall percentage, category-wise scores, key strengths, and specific topics recommended for further study.
