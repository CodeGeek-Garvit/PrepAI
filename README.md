# PrepAI — AI-Powered Interview Preparation Platform

PrepAI is an intelligent web application designed to help students and job seekers master their interview skills. By leveraging the power of Gemini AI, PrepAI provides personalized resume feedback, ATS scoring, and realistic mock interview simulations with qualitative evaluations.

## 🚀 Features

- **AI Resume Analysis**: Upload your PDF resume to get an instant ATS score, strengths/weaknesses breakdown, and actionable formatting tips.
- **Personalized Interview Generator**: Generate tailored interview questions based on your target role, tech stack, and experience level.
- **Interactive Mock Interviews**: Submit your answers via text and receive real-time AI feedback on clarity, technical accuracy, and communication.
- **Smart Dashboard**: Track your progress over time, view your analysis history, and get smart tips to boost your employability.
- **Secure Authentication**: Protected accounts using JWT and bcrypt password hashing.

## 🛠 Tech Stack

- **Frontend**: React (Vite), TailwindCSS, React Router, Motion (Animations), Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **AI**: Google Gemini AI (@google/genai)
- **File Handling**: Multer & pdf-parse

## ⚙️ Setup Instructions

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas URI)
- Gemini API Key (from Google AI Studio)

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory (use `.env.example` as a template):
   ```env
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📜 Deployment

The application is structured to be easily deployable:
- **Frontend**: Can be deployed as a static site (after `npm run build`) or served via the Express backend.
- **Backend**: Deployable to platforms like Render, Railway, or Heroku.
- **Environment Variables**: Ensure `NODE_ENV` is set to `production` to serve static files correctly.

## 🏗 Architecture Overview

PrepAI follows a full-stack architecture where the Express server acts as both the API provider and the static file server in production. Gemini AI calls are handled securely on the server side to protect API keys.

```text
Frontend (React) <---> Backend (Express) <---> MongoDB
                          |
                          v
                      Gemini AI
```

---
Built with ❤️ by the PrepAI Team.
