# PrepAI — AI-Powered Career Preparation Platform

PrepAI is a full-stack AI-powered career companion designed to help students and job seekers improve their resumes, prepare for interviews, and optimize their chances of getting shortlisted by modern ATS systems.

By leveraging the power of Google Gemini AI, PrepAI provides intelligent resume analysis, job-description matching, company-specific mock interviews, and personalized AI-driven feedback — all inside a modern responsive web application.

---

## 🎯 Problem Statement

Many students struggle with resume optimization and interview preparation due to the lack of personalized, affordable, and real-time career guidance tools.

PrepAI bridges this gap using AI-powered resume analysis, ATS optimization, job-description matching, and adaptive mock interview simulations.

---

# 🚀 Core Features

## 📄 AI Resume Analyzer
Upload your PDF resume and receive:

- ATS Compatibility Score
- Strengths & Weaknesses Breakdown
- Missing Skills Detection
- Formatting & Optimization Suggestions
- Resume Quality Insights
- Recruiter-Focused Improvement Tips

---

## 🎯 JD Matcher (Resume vs Job Description)
Compare your resume directly against a target job description.

### Provides:
- Match Percentage
- Missing Keywords
- Skill Gap Analysis
- Recruiter Alignment Insights
- ATS Optimization Suggestions

---

## 🎤 AI Mock Interview System
Practice realistic interview scenarios with AI-generated questions.

### Supports:
- Technical Interviews
- Behavioral Interviews
- Role-Based Interviews
- Experience-Level Personalization
- Real-Time AI Evaluations

### AI Feedback Includes:
- Clarity Score
- Technical Accuracy
- Communication Analysis
- Confidence Evaluation
- Improvement Suggestions

---

## 🏢 Company-Specific Interview Mode
Generate interview rounds tailored for specific companies.

Examples:
- Google
- Amazon
- Microsoft
- Meta
- Netflix
- Startups & Product Companies

The system adapts:
- Interview difficulty
- Question style
- Leadership principles
- Technical depth
- Behavioral expectations

---

## 📊 Smart Dashboard & Analytics
Track your interview preparation journey over time.

### Includes:
- Resume Analysis History
- ATS Score Tracking
- Interview Performance Trends
- JD Matching Progress
- AI Feedback History

---

## 🛡 Secure Authentication System
Full-stack authentication system with:

- JWT-based Authentication
- bcrypt Password Hashing
- Protected Routes
- Persistent User Sessions
- Secure Backend Validation

---

# 🛡 AI Reliability Features

PrepAI includes several production-style AI reliability systems:

- Retry-based Gemini request handling
- Intelligent fallback responses
- Runtime AI validation
- Dynamic API initialization
- Request-level failure recovery
- Detailed server-side diagnostics
- AI health debugging endpoints

---

# 🛠 Tech Stack

## Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Axios
- React Router

## Backend
- Node.js
- Express.js
- TypeScript
- REST APIs

## Database
- MongoDB
- Mongoose ODM

## AI / ML
- Google Gemini AI (`@google/genai`)

## Utilities
- Multer (File Uploads)
- pdf-parse (PDF Extraction)
- JWT Authentication
- bcryptjs

---

# 🏗 System Architecture

```text
Frontend (React + Vite)
        ↓
REST API Layer (Express.js)
        ↓
Business Logic & AI Services
        ↓
Gemini AI + MongoDB
