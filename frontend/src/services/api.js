import axios from 'axios';

const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // Return empty string to let axios use the current origin (e.g. phone's IP:5173).
    // Vite will then proxy these requests internally to port 8000.
    return '';
};

const API = axios.create({
    baseURL: getBaseUrl(),
});

// Interview start karo
export const startInterview = (data) => API.post('/interview/start', data);

// Next question lo
export const getNextQuestion = (sessionId) =>
    API.post(`/interview/next-question?session_id=${sessionId}`);

// Answer submit karo
export const submitAnswer = (data) => API.post('/interview/submit-answer', data);

// Score + Full Report lo
export const getScore = (sessionId) => API.get(`/feedback/score/${sessionId}`);

// Interview end karo
export const endInterview = (sessionId) =>
    API.post(`/interview/end/${sessionId}`);

// Submit User Feedback/Review
export const submitAppReview = (data) =>
    API.post(`/feedback/submit_review`, data);

// User memory fetch karo
export const getUserMemory = (userName) =>
    API.get(`/interview/memory/${encodeURIComponent(userName)}`);

// Auth APIs
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);
export const getMe = (token) => API.get(`/auth/me/${token}`);
