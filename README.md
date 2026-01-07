# StudyNowAI 🎓

> **Making studying simpler, smarter, and stress-free!**

StudyNowAI is an AI-powered personalized study assistant designed to transform the self-learning experience. It leverages Generative AI (Google Gemini) to act as a personal tutor that plans studies, curates resources, and assesses progress.

---

## 📖 Table of Contents
- [Overview](#overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Proctoring System](#-proctoring-system)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Future Enhancements](#-future-enhancements)

---

## Overview

Self-learners often struggle with organizing their study path and verifying their knowledge, leading to "analysis paralysis". StudyNowAI solves this by:
1.  **Automating Planning**: Generating structured roadmaps for any topic.
2.  **Curating Resources**: Finding high-quality tutorials and documentation.
3.  **Verifying Knowledge**: Creating adaptive quizzes with instant feedback.
4.  **Ensuring Integrity**: Using a smart proctoring system for assessments.

---

## 🚀 Key Features

### 1. 🧠 AI Roadmap Generation
- **Structured Learning**: Decomposes any topic (e.g., "React Hooks") into a step-by-step roadmap.
- **Gemini Powered**: Uses Google's Gemini 1.5 Flash model for accurate and logical study paths.

### 2. 📚 Smart Resource Curation
- **Context-Aware**: AI evaluates and ranks video and text resources for each learning step.
- **Relevance Scoring**: Prioritizes high-quality content to save study time.

### 3. 🎯 Adaptive Assessment
- **Dynamic Quizzes**: Generates questions based on the specific topic and difficulty level (Easy, Medium, Hard).
- **Instant Feedback**: Explains why answers are correct or incorrect.

### 4. 📊 Dashboard & Progress Tracking
- **Visual Analytics**: Track topics across statuses: "New", "Learning", "Revise", "Completed".
- **Study Plans**: View generated schedules and mastery levels.

### 5. 🛡️ Secure Proctoring
- **Integrity Validation**: Ensures quiz authenticity through browser-based monitoring.

---

## 🏗 Architecture

**Flow:** `User -> React Frontend -> Express API -> AI Service -> Gemini -> Database -> Response to User`

1.  **Frontend**: React.js + Tailwind CSS (User Interface)
2.  **Backend**: Node.js + Express.js (API Layer)
3.  **Database**: MongoDB (Stores Users, Topics, Progress)
4.  **AI Engine**: Google Gemini API (Generates JSON Roadmaps & Quizzes)

---

## 🧰 Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose
- **Authentication**: JWT & Bcrypt
- **AI Integration**: Google Generative AI SDK

---

## 👁️ Proctoring System

The application includes a comprehensive proctoring system to ensure academic integrity during quizzes.

### Monitoring Features
1.  **Camera Monitoring**: Displays a live video feed and requests user presence.
2.  **Face Presence Detection**: Monitors for face presence using brightness and motion analysis (Privacy-focused: no facial recognition data stored).
3.  **Fullscreen Enforcement**: Requires the quiz to be taken in fullscreen mode; logs violations on exit.
4.  **Tab Switching Detection**: Detects and warns when the user leaves the quiz tab or minimizes the window.
5.  **Copy/Paste Prevention**: Blocks clipboard actions and text selection.
6.  **Screenshot Prevention**: Intercepts common keyboard shortcuts for screenshots.

### Violation Logging
- Violations (e.g., "Tab Switched", "Fullscreen Exited") are recorded with timestamps.
- A summary is presented at the end of the quiz with a color-coded integrity score (Green/Yellow/Red).

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/StudyNowAI.git
    cd StudyNowAI
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    # Setup .env file (see below)
    npm start
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    # Setup .env file (see below)
    npm run dev
    ```

---

## 📁 Environment Variables

Create specific `.env` files in the `backend` and `frontend` directories.

### Backend (`backend/.env`)
```env
MONGO_URI=mongodb://localhost:27017/studynowai
JWT_SECRET=your_jwt_secret_key
PORT=5000
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
GEMINI_API_KEY=your_google_gemini_api_key
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/
```

---

## 🗂 Project Structure

```
StudyNowAI/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI (ProctorMonitor, QuizPage, etc.)
│   │   ├── features/       # Redux slices
│   │   ├── pages/          # Dashboard, Login, Topic Details
│   │   ├── services/       # API integration
│   │   └── ...
│   └── ...
├── backend/
│   ├── src/
│   │   ├── controllers/    # Logic for Roadmap, Quiz, Auth
│   │   ├── models/         # Mongoose User, Topic schemas
│   │   ├── services/       # AI Service (Gemini), Proctoring logic
│   │   └── ...
│   └── ...
└── README.md
```

---

## 🔮 Future Enhancements

1.  **PDF-to-Roadmap**: Upload textbooks to generate custom study plans.
2.  **Spaced Repetition (SRS)**: Automated review scheduling based on the "Forgetting Curve".
3.  **Mobile App**: React Native version for on-the-go learning.
4.  **Gamification**: Leaderboards, streaks, and achievement badges.

---

**StudyNowAI** – *Empowering self-learners with AI.*
