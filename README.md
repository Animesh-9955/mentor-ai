# MentorAI - Premium Gamified AI Tutor Platform

MentorAI is a premium, highly interactive gamified AI Tutor web application designed to teach users structured topics rather than acting as a simple Q&A chatbot.

## Features (Phase 1)
- **Interactive AI Teacher Studio**: Input any topic (e.g. *Binary Search*, *React hooks*, etc.) and choose a learning style (ELI5, Professor, Interview, Story mode) to generate customized markdown outlines and interactive Whiteboards.
- **Dynamic Roadmap Generator**: Automatically outlines visual learning steps. Click nodes to study or launch the final Boss Battle.
- **Quiz Arena & Boss Battles**: Gamified quiz battles where answering correctly deals damage to the chapter boss, and answering wrong attacks your player health hearts. Earn XP and Coins on victory!
- **Study Vault & Slide PPT Presenter**: Previews compiled lessons, lets you download markdown study sheets locally, or compiles clean slide presentation decks with navigation controls.
- **Multi-LLM Router Console**: Simulates (offline) or runs real-time API calls to Gemini, OpenAI, or DeepSeek. Displays live charts of latency and cost, and records failover cascading rotations.
- **Google Drive Sync**: Seamlessly syncs generated courses and assets to a virtual drive drawer automatically.
- **Gamification Dashboard**: Track streakes, missions, coins, XP, levels, and view global leaderboards.
- **ZenTask Integration**: Directly import CSV files from ZenTask to sync user tasks and feed weak topics into the spaced repetition retention monitor.

## Setup Instructions

MentorAI is built as a zero-dependency high-fidelity web application.

1. Navigate to the project folder:
   ```bash
   cd /Users/animeshpatel/Desktop/AntiGravity/mentor-ai
   ```
2. Start the local server:
   ```bash
   python3 server.py
   ```
3. Open the application in your browser:
   * **URL**: [http://localhost:8080](http://localhost:8080)

## API Settings
To connect real-time LLM engines:
1. Navigate to the **LLM Router** tab.
2. Uncheck **Simulate LLM responses (Offline)**.
3. Paste your Gemini, OpenAI, or DeepSeek API keys. They will be stored securely in your browser's local storage and used directly in client-side queries.
