# StudyNowAI 🎓

> **Making studying simpler, smarter, and stress-free!**

StudyNowAI is an AI-powered personalized study assistant designed to transform the self-learning experience. It leverages Generative AI (Google Gemini) and a novel **Hybrid Intelligence Architecture** to act as a personal tutor that plans studies, curates resources, and assesses progress.

---

## 📖 Table of Contents
- [Overview](#overview)
- [Key Features](#-key-features)
- [DAACS Scheduler](#-daacs-scheduler)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Proctoring System](#-proctoring-system)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)

---

## Overview

Self-learners often struggle with organizing their study path and verifying their knowledge, leading to "analysis paralysis". StudyNowAI solves this by:
1.  **Automating Planning**: Generating structured roadmaps and schedules using **DAACS**.
2.  **Curating Resources**: Finding high-quality tutorials and documentation.
3.  **Verifying Knowledge**: Creating adaptive quizzes with instant feedback.
4.  **Ensuring Integrity**: Using a smart proctoring system for assessments.

---

## 🚀 Key Features

### 1. 📅 Deadline-Aware Adaptive Curriculum Scheduler (DAACS)
- **Topological Optimization**: Automatically schedules topics based on prerequisite dependencies (Graphs).
- **Capacity Planning**: Respects your daily study limits (e.g., 2 hours/day) and prevents burnout.
- **Learner Modeling**: Adjusts the schedule based on your personal Learning Rate ($\alpha$), Retention ($\beta$), and Consistency ($\phi$).
- **Priority Queue**: Dynamically prioritizes tasks based on deadlines and difficulty.

### 2. 🧠 AI Roadmap Generation
- **Structured Learning**: Decomposes any topic (e.g., "React Hooks") into a step-by-step roadmap.
- **Gemini Powered**: Uses Google's Gemini 1.5 Flash model for accurate and logical study paths.

### 3. 📚 Smart Resource Curation
- **Context-Aware**: AI evaluates and ranks video and text resources for each learning step.
- **Relevance Scoring**: Prioritizes high-quality content to save study time.

### 4. 🎯 Adaptive Assessment
- **Dynamic Quizzes**: Generates questions based on the specific topic and difficulty level.
- **Instant Feedback**: Explains why answers are correct or incorrect.

### 5. �️ Secure Proctoring
- **Integrity Validation**: Ensures quiz authenticity through browser-based monitoring (Tab switching, Fullscreen enforcement).

---

## 📅 DAACS Scheduler

The **Deadline-Aware Adaptive Curriculum Scheduler** is the brain of StudyNowAI. It treats your learning path as a "Resource-Constrained Project Scheduling Problem" (RCPSP).

### How it Works
1.  **Define Profile**: Go to **Settings > Learner Profile** to set your:
    *   **Learning Rate ($\alpha$)**: How fast you learn relative to the average.
    *   **Daily Capacity**: Maximum hours you can study per day.
2.  **Add Topics**: When creating topics, you can now specify **Prerequisites** and **Estimated Time**.
3.  **Generate Plan**: Click **"Generate AI Schedule"** on the Schedules page. The Python-based Tactical Scheduler will:
    *   Build a Dependency Graph of your topics.
    *   Sort them topologically (Prerequisites first).
    *   Assign dates based on your speed and capacity.

---

## 🏗 Architecture

**Hybrid Intelligence Framework:**

The system operates as a closed-loop control system integrating Node.js for application logic and Python for complex combinatorial optimization.

**Flow:** `User -> React Frontend -> Express API -> (Data Exchange) -> Python DAACS Engine -> Database -> Response`

1.  **Frontend**: React.js + Tailwind CSS + Redux (UI & State)
2.  **Backend API**: Node.js + Express.js (Orchestration)
3.  **Optimization Engine**: Python 3.x (Pandas, NumPy)
    *   *Role*: Handles topological sorting and heuristic scheduling algorithms.
4.  **AI Engine**: Google Gemini API (Generative Content)
5.  **Database**: MongoDB (Stores Graphs, User Profiles, Logs)

---

## 🧰 Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **State**: Redux Toolkit (Persistent State)
- **Styling**: Tailwind CSS + Framer Motion
- **HTTP**: Axios

### Backend & AI
- **Runtime**: Node.js & Python 3.9+
- **Database**: MongoDB & Mongoose
- **Auth**: JWT & Bcrypt
- **GenAI**: Google Gemini SDK
- **Data Science**: Pandas, NumPy (for DAACS)

---

## 👁️ Proctoring System

The application includes a comprehensive proctoring system to ensure academic integrity during quizzes.

### Monitoring Features
1.  **Face Presence Detection**: Monitors for face presence using brightness and motion analysis.
2.  **Fullscreen Enforcement**: Requires the quiz to be taken in fullscreen mode.
3.  **Tab Switching Detection**: Detects when the user leaves the quiz tab.
4.  **Anti-Cheating**: Blocks clipboard actions (Copy/Paste) and context menus.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.8+) with `pandas`, `numpy`
- MongoDB

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
    # Install Python dependencies
    pip install pandas numpy scikit-learn
    npm start
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

## 📁 Environment Variables

### Backend (`backend/.env`)
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
PORT=5000
GEMINI_API_KEY=your_gemini_key
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

## 🗂 Project Structure

```
StudyNowAI/
├── frontend/ (React)
│   ├── src/pages/          # Schedules (DAACS UI), Topics, Quiz
│   ├── src/features/       # Redux Logic
│   └── ...
├── backend/ (Node.js)
│   ├── src/controllers/    # Auth, Topic, Scheduler Controllers
│   ├── src/ml/             # Python DAACS Engine (scheduler.py)
│   ├── src/models/         # User (Profile), Topic (Graph)
│   └── ...
└── README.md
```

---

**StudyNowAI** – *Empowering self-learners with Hybrid AI.*
