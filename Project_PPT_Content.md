# Project Presentation Content

## (i) Student Name with Guide Name & Designation
*   **Student Name:** [Student Name]
*   **Reg No:** [Register Number]
*   **Guide Name:** [Guide Name]
*   **Designation:** [Designation]
*   **Department:** [Department Name]

---

## (ii) Introduction
*   **Overview:** StudyNowAI is an AI-powered personalized study assistant designed to transform the self-learning experience.
*   **Core Idea:** It leverages Generative AI (Google Gemini) to act as a personal tutor that plans studies, curates resources, and assesses progress.
*   **Goal:** To eliminate "analysis paralysis" by automatically generating structured roadmaps and verify learning through adaptive quizzes.

---

## (iii) Literature Survey and Drawbacks of Existing Models

### Existing System 1: Manual Web Searching (Google/YouTube)
*   **Approach:** Students manually search for topics and filter through thousands of results.
*   **Drawbacks:**
    *   **Time Consuming:** 30-40% of study time is wasted just finding the right content.
    *   **Information Overload:** Difficulty in verifying the accuracy and relevance of resources.
    *   **Lack of Structure:** No clear path (roadmap) to master a complex subject.

### Existing System 2: MOOCs (Udemy/Coursera)
*   **Approach:** Pre-recorded, fixed-syllabus courses.
*   **Drawbacks:**
    *   **Rigidity:** One-size-fits-all approach doesn't adapt to the student's specific pace or knowledge gaps.
    *   **Cost:** Quality courses are often behind paywalls.

### Existing System 3: Static Quiz Applications
*   **Approach:** Apps with a fixed database of questions.
*   **Drawbacks:**
    *   **Limited Content:** Cannot generate questions for new or niche topics dynamically.
    *   **No Feedback Loop:** Doesn't explain *why* an answer is wrong or link back to study materials.

---

## (iv) Problem Definition
*   **The Problem:** Self-learners often struggle with organizing their study path and verifying their knowledge. This leads to inefficient learning and loss of motivation.
*   **Key Challenges:**
    1.  Creating a valid, step-by-step syllabus for any given topic.
    2.  Finding high-quality, verified learning resources without distractions.
    3.  Getting immediate, personalized assessment and feedback.

---

## (v) Objectives of the Project
1.  **AI Roadmap Generation:** To automatically generate a structured, step-by-step study plan for any user-entered topic using Generative AI.
2.  **Intelligent Resource Curation:** To fetch and rank high-quality tutorials (Videos/Articles) for each learning step.
3.  **Adaptive Assessment:** To generate dynamic quizzes with varying difficulty levels (Easy, Medium, Hard) to test understanding.
4.  **Progress Tracking:** To provide a dashboard for tracking learning status (New, Learning, Revised, Completed).

---

## (vi) Proposed Solution
*   **Platform:** A web-based application (MERN Stack) integrated with the Gemini 1.5 Flash AI model.
*   **Workflow:**
    1.  **Input:** User enters a topic (e.g., "React Hooks").
    2.  **Structure:** AI decomposes the topic into a roadmap (e.g., "useState", "useEffect").
    3.  **Learn:** System provides curated YouTube videos and docs for each sub-topic.
    4.  **Verify:** User takes an AI-generated quiz to validate mastery.

---

## (vii) Proposed Architecture Diagram
*(Description for Diagram)*
1.  **Frontend (Client):** React.js + Tailwind CSS (User Interface)
2.  **Backend (Server):** Node.js + Express.js (API Layer)
3.  **Database:** MongoDB (Stores Users, Topics, Progress)
4.  **AI Engine:** Google Gemini API (Generates JSON Roadmaps & Quizzes)

**Flow:** `User -> React Frontend -> Express API -> AI Service -> Gemini -> Database -> Response to User`

---

## (viii) List of Modules
1.  **User Authentication Module**
2.  **Dashboard & Topic Management Module**
3.  **AI Roadmap Generation Module**
4.  **Smart Resource Curation Module**
5.  **Interactive Quiz & Assessment Module**

---

## (ix) Explanation of Each Module

### 1. User Authentication Module
*   **Algorithm:** JSON Web Tokens (JWT) & Bcrypt Hashing.
*   **Process Flow:**
    *   User enters credentials -> Server verifies hash -> Issues JWT -> Client stores token for session.
*   **Output Screenshot:** *[Insert Screenshot of Login/Register Page]*

### 2. AI Roadmap Generation Module
*   **Algorithm:** **Structured Prompt Engineering**.
    *   Uses a strict JSON schema prompt to force the LLM to return a parseable array of steps.
*   **Process Flow:**
    *   `Create Topic` -> `AI Service` -> `Gemini Prompt` -> `JSON Parsing` -> `Save to MongoDB`.
*   **Output Screenshot:** *[Insert Screenshot of Topic Roadmap Timeline]*

### 3. Smart Resource Curation Module
*   **Algorithm:** **Semantic Relevance Scoring**.
    *   AI evaluates potential resources and assigns a "Relevance Score" (80-99%) to prioritize high-quality documentation and videos.
*   **Process Flow:**
    *   `Click Step` -> `Check Cache` -> `If Miss, Call AI` -> `AI Searches & Ranks` -> `Display Resources`.
*   **Output Screenshot:** *[Insert Screenshot of Study Resources Page with Video Cards]*

### 4. Interactive Quiz & Assessment Module
*   **Algorithm:** **Adaptive Difficulty Segmentation**.
    *   Generates 15 questions distributed as 5 Easy, 5 Medium, and 5 Hard.
*   **Process Flow:**
    *   `Request Quiz` -> `AI Generates Questions` -> `User Submits` -> `Score Calculation` -> `Progress Update`.
*   **Output Screenshot:** *[Insert Screenshot of Quiz Interface and Result Modal]*

---

## Conclusion
*   StudyNowAI successfully integrates Generative AI into the self-learning workflow.
*   By automating the planning and searching phases, it allows students to focus entirely on learning.
*   The system acts as an effective personalized tutor that adapts to any topic, providing structured guidance and verified feedback.

---

## Future Enhancements
1.  **File-Based Learning:** Ability to upload PDF textbooks and generate roadmaps specifically from the document content.
2.  **Spaced Repetition System (SRS):** Automated scheduling of reviews based on the "Forgetting Curve".
3.  **Mobile App:** A React Native version for learning on the go.
4.  **Gamification:** Leaderboards and study streaks to improve motivation.

---

## References
1.  **Google Generative AI SDK:** https://ai.google.dev/
2.  **React Documentation:** https://react.dev/
3.  **MongoDB Documentation:** https://www.mongodb.com/docs/
4.  **Node.js Runtime:** https://nodejs.org/
5.  **Tailwind CSS:** https://tailwindcss.com/
