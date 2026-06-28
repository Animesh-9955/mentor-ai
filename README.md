# 🎓 MentorAI - Premium Gamified AI Tutor Platform

MentorAI is a premium, highly interactive gamified AI Tutor web application designed to teach users structured topics rather than acting as a simple Q&A chatbot. By blending generative AI, game mechanics, and cloud integrations, MentorAI builds personalized learning paths, interactive slide decks, custom quizzes, and visual roadmaps for any subject.

---

## 🚀 Key Features

### 1. 🧠 AI Teacher
- **Topic-Driven Lessons**: Enter any topic (e.g., *Organic Chemistry*, *Binary Search*, *Quantum Mechanics*) and receive customized, structured study modules.
- **Multiple Learning Styles**: Choose between different teaching modes like **College Professor (Standard)**, **ELI5 (Explain Like I'm Five)**, **Tech Interview Prep**, and **Immersive Storytelling**.
- **Interactive Whiteboard & Slide Decks**: View visual concept maps on the whiteboard and navigate auto-generated presentation slides.
- **Export Formats**: Download generated outlines and study notes directly as Markdown or MS Word (`.docx`) documents.

### 2. 🗺️ Dynamic Roadmap Generator
- **Visual Learning Paths**: Automatically maps out step-by-step progress nodes.
- **Interactive Nodes**: Track progress across sections (Intro, Core Concepts, Code/Math, and the final Boss Battle).
- **Gamified Progression**: Lock/unlock subsequent learning tiers as you complete quizzes.

### 3. ⚔️ Quiz Arena & Boss Battles
- **Interactive Boss Battles**: Face off against chapter bosses where answering questions correctly deals damage to the boss, and answering wrong depletes your player health hearts!
- **Hints & Explanations**: Use local coin loot to buy hints during battles.
- **Spaced Repetition Sync**: Tracked weak topics are fed into your personal study dashboard for active retention monitoring.

### 4. 📂 Google Drive & Sheets Cloud Sync
- **Serverless Google Sheets DB**: Bypass ephemeral disk storage (like Render's filesystem) using a Google Apps Script Web App proxy as a robust, permanent KV database store.
- **Auto-Sync to Google Drive**: Sync generated courses, lessons, and flashcards directly as Markdown files inside a shared Google Drive folder.
- **Persistent Profiles & Vaults**: User logins, coin balances, streaks, XP, level records, and chat history persist securely across server restarts.

### 5. 🎛️ Multi-LLM Router Console
- **Multi-API Key Rotation**: Automatically rotates through pools of keys for Gemini, Grok, and OpenAI.
- **Automatic Cascading Failover**: If one API key is rate-limited or fails, the router automatically falls back to secondary keys and alternative models.
- **JSON Structured Output Mode**: Guarantees that the LLM generates valid JSON formats to prevent UI rendering errors.

---

## 📁 Project Architecture

```
mentor-ai/
├── backend/
│   ├── auth.py          # Password hashing, JWT auth, and active user sessions
│   ├── main.py          # FastAPI application server & REST endpoints
│   ├── sheets_store.py  # HTTP client communicating with Google Apps Script
│   └── ai_engine.py     # LLM API orchestrator with rotation, failover, & JSON mode
├── frontend/
│   ├── index.html       # Single Page Application structure
│   ├── styles.css       # Premium custom glassmorphism design styling
│   ├── app.js           # Frontend navigation, state management, and UI logic
│   ├── logo.png         # Brand logo asset (Neon Synapse)
│   └── favicon.ico      # Tab icon
├── run.py               # Main uvicorn server launcher
└── requirements.txt     # Python backend dependencies
```

---

## 🛠️ Setup & Installation Instructions

### 1. Prerequisites
- Python 3.9 or higher installed.
- Active Google Account (for Google Sheets/Drive integration).

### 2. Local Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Animesh-9955/mentor-ai.git
   cd mentor-ai
   ```
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment variables template and configure it:
   ```bash
   cp backend/.env.example backend/.env
   ```

---

## ⚙️ Environment Variables Configuration

Configure the following variables in your `backend/.env` file (and add them to Render Dashboard under **Environment Settings**):

| Variable Name | Description | Example / Default |
| :--- | :--- | :--- |
| `GEMINI_API_KEYS` | Comma-separated list of Gemini API keys for rotation. | `AIzaSyD...` |
| `GROK_API_KEYS` | Comma-separated list of Grok API keys for rotation. | `xai-bqV...` |
| `JWT_SECRET` | Secret key used to sign session JWT tokens. | `your-random-jwt-secret-string` |
| `GOOGLE_SHEET_URL` | Deployed Google Apps Script Web App execution URL. | `https://script.google.com/macros/s/.../exec` |

---

## ☁️ Google Sheets Web App Database Integration

To host data persistently on Google Sheets:
1. Open a new Google Sheet and name it `AI_Teacher`.
2. Go to **Extensions** -> **Apps Script** and paste the serverless KV store script.
3. Deploy as a **Web App**:
   - **Execute as**: Me (your email).
   - **Who has access**: Anyone.
4. Copy the generated Web App URL and paste it under the `GOOGLE_SHEET_URL` environment variable.

---

## 🏃 Running the Application

To start the server locally:
```bash
python3 run.py
```
Open your browser and navigate to **[http://localhost:8080](http://localhost:8080)**.

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.
