# 🚀 InterviewAI - Your Personal Tech Interview Coach

![InterviewAI Banner](https://img.shields.io/badge/AI_Powered-Interview_Prep-06b6d4?style=for-the-badge&logo=openai)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

**InterviewAI** is an intelligent, full-stack web application designed to help developers ace their technical interviews. By leveraging Advanced Large Language Models (LLMs), the platform generates customized technical questions, dynamically adjusts timers based on difficulty, evaluates your answers in real-time, and provides highly detailed feedback across 6 critical parameters.

## ✨ Key Features

- **🧠 Dynamic AI Generation:** Powered by **Groq LLaMA-3.3-70B** via Prompt Engineering to generate highly relevant questions tailored to specific tech stacks (Python, React, JS, Java, Node.js, SQL) and difficulty levels.
- **⏱️ Standardized Interview Sessions:** Each session consists of exactly 15 questions (6 MCQs and 9 Descriptive).
- **⏳ Dynamic Timers:** Smart countdown timers that automatically adjust based on the difficulty of the question and whether it's an MCQ or Descriptive type.
- **📊 Advanced 6-Parameter Evaluation:** The AI analyzes descriptive answers and scores candidates on:
  1. Technical Knowledge
  2. Concept Understanding
  3. Problem Solving
  4. Communication
  5. Confidence
  6. Clarity
- **🎯 Weak Area Identification:** Automatically detects and highlights topics where the candidate struggled, providing actionable feedback for improvement.
- **🔐 Secure Authentication:** Full user authentication system with JWT (JSON Web Tokens) and Bcrypt password hashing.
- **📧 Asynchronous Email Notifications:** Uses an advanced `asyncio.Queue` background worker system to send HTML Welcome and Login alerts via SMTP without blocking the API, ensuring lightning-fast (100ms) user signups and logins.
- **🛡️ Custom Rate Limiting & Security:** Built-in lightweight middleware to limit requests (100 req/min per IP) and protect the backend from spam/abuse.
- **⚡ High-Performance Database:** Utilizes MongoDB Atlas with unique indexing (on `email` and `session_id`) for ultra-fast `O(1)` query lookups.
- **🌗 Theme System:** Custom Dark/Light theme built with React Context API and `localStorage` persistence.
- **📱 Fully Responsive UI:** A premium, glassmorphism-inspired interface that looks stunning on Mobile, Tablet, and Desktop.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js (Vite)
- **Routing:** React Router DOM
- **Styling:** Custom CSS (Grid/Flexbox, Glassmorphism, CSS Variables, Theming)
- **State Management & API:** React Context API, Axios

### Backend
- **Framework:** FastAPI (Python)
- **AI/LLM:** Groq API (LLaMA-3.3-70B-Versatile)
- **Database:** MongoDB Atlas (Motor/PyMongo)
- **Auth & Security:** JWT, Passlib (Bcrypt)
- **Concurrency:** `asyncio.Queue` & `threading` for background tasks
- **Email:** Python `smtplib`

## 🚀 Getting Started (Local Development)

Follow these steps to run the project locally on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/Chavda-Jay/interview-prep-bot.git
cd interview-prep-bot
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows
venv\Scripts\activate 
# On Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file inside `config/` and add:
```env
GROQ_API_KEY=your_groq_api_key
MONGO_URI=your_mongodb_connection_string
MONGO_DB_NAME=interview_prep
EMAIL_SENDER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

Run the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
```

Start the dev server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

## 🌍 Deployment

- **Frontend:** Deployed seamlessly on [Vercel](https://vercel.com).
- **Backend:** Deployed on [Render](https://render.com).

## 👨‍💻 Developed By

Built with ❤️ by **Jay Chavda**. 
A showcase of full-stack engineering, AI integration, and robust system design.

---

*If you found this project helpful, don't forget to give it a ⭐ on GitHub!*
