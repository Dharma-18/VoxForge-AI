# ⚡ VoxForge AI

<p align="center">
  <b>Speak. Build. Forge the Web with AI.</b><br/>
  A futuristic AI-powered web development IDE with a 3D voice assistant.
</p>

---

## 🚀 Tech Stack

### 🎨 Frontend
<p align="center">
  <img src="https://skillicons.dev/icons?i=react,vite,tailwind,threejs,js,html,css" />
</p>

### ⚙️ Backend
<p align="center">
  <img src="https://skillicons.dev/icons?i=python,fastapi" />
</p>

### 🛠️ Tools & Libraries
<p align="center">
  <img src="https://skillicons.dev/icons?i=git,github,vscode" />
</p>

---

## 🧠 Overview

**VoxForge AI** is a next-generation development environment where users build websites using **voice and text commands** through an intelligent 3D assistant called **AURA**.

---

## ✨ Features

- 🤖 3D AI Robot (AURA)
- 🎤 Voice Interaction (Speech-to-Text & Text-to-Speech)
- 💻 Monaco Code Editor
- 🔴 Live Preview
- 🧩 Structured AI Commands (JSON-based)
- 🛡️ Constraint Engine
- 🖥️ Terminal Logs Panel

---

## 🏗️ Architecture

```mermaid
flowchart LR
    User -->|Voice/Text| AURA
    AURA --> Frontend
    Frontend -->|API| Backend
    Backend --> IntentParser
    IntentParser --> ConstraintEngine
    ConstraintEngine --> CommandExecutor
    CommandExecutor --> Editor
    Editor --> Preview


📁 Project Structure

VoxForge-AI/
│
├── frontend/                 # React App
├── backend/                  # FastAPI Server
└── .github/workflows/        # CI/CD
⚙️ Setup
🔧 Prerequisites
Node.js 20+
Python 3.11+
▶️ Frontend
Bash
cd frontend
npm install
npm run dev
▶️ Backend
Windows
Bash
cd backend
python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn main:app --reload
Linux / macOS
Bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
🎮 Usage
Try commands like:
"Change background to black"
"Add a button"
"Increase font size"
"Create a navbar"
🧩 AI Command Example
JSON
{
  "action": "update_style",
  "target": "body",
  "property": "background-color",
  "value": "#0000ff"
}
📦 Build
Bash
cd frontend
npm run build
🤝 Contributing
Fork the repo
Create your feature branch
Commit changes
Submit a Pull Request
📜 License
MIT License © 2026 VoxForge AI
🌟 Future Roadmap
🧠 Advanced AI reasoning
🌐 Full-stack generation
🎨 Auto UI design
🤝 Real-time collaboration
💡 Final Thought
The future of coding isn’t typing — it’s commanding.
