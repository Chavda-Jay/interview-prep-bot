# 🚀 InterviewAI - Your Personal Tech Interview Coach

![InterviewAI Banner](https://img.shields.io/badge/AI_Powered-Interview_Prep-06b6d4?style=for-the-badge&logo=openai)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

**InterviewAI** is an intelligent, full-stack web application designed to help developers ace their technical interviews. By leveraging Advanced Large Language Models (LLMs), the bot dynamically generates customized technical questions based on your chosen technology and difficulty level, evaluates your answers in real-time, and provides detailed feedback and scoring.

## ✨ Features

- **🧠 Dynamic AI Questions:** Generates unique questions using Groq API (Llama-3/Mixtral) tailored to specific tech stacks (Python, React, SQL, etc.) and difficulty levels (Beginner, Intermediate, Advanced).
- **📝 Real-time Evaluation:** Analyzes your answers instantly, highlighting what you got right and what you missed.
- **🔐 Secure Authentication:** Full user authentication system with JWT tokens.
- **📧 Email Notifications:** Automated HTML emails for Welcome Alerts and Security/Login Alerts using SMTP.
- **📱 Fully Responsive UI:** A premium, modern, glassmorphism-inspired UI that works flawlessly on Mobile, Tablet, and Desktop.
- **💾 Persistence:** Saves user profiles, session histories, and scores securely in MongoDB.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js (Vite)
- **Routing:** React Router DOM
- **Styling:** Custom CSS (Grid/Flexbox, Glassmorphism, CSS Variables)
- **State Management & API:** Axios

### Backend
- **Framework:** FastAPI (Python)
- **AI/LLM:** Groq API
- **Database:** MongoDB Atlas (Motor/PyMongo)
- **Auth & Security:** JWT (JSON Web Tokens), Passlib (Bcrypt)
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

Create a `.env` file inside `config/` (at the root or wherever specified in your code) and add:
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

Create a `.env` file in the `frontend` folder if you need custom API mapping, or let it default to localhost. Then start the dev server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

## 🌍 Deployment

- **Frontend:** Deployed seamlessly on [Vercel](https://vercel.com). Just import the repo and set the `VITE_API_URL` environment variable.
- **Backend:** Deployed on [Render](https://render.com) using the `requirements.txt`. Remember to configure CORS by adding the `FRONTEND_URL` environment variable.

## 👨‍💻 Developed By

Built with ❤️ by **Jay Chavda / Saubhagyam**. 
A showcase of full-stack engineering, AI integration, and robust system design.

---

*If you found this project helpful, don't forget to give it a ⭐ on GitHub!*
