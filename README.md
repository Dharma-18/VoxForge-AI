# VoxForge AI

**A Futuristic Conversational AI IDE with 3D Interactive Voice Robot for Live Web Development**

VoxForge AI is a web-based AI development environment where users can build and modify websites using voice and text instructions through a 3D animated robot agent (**AURA**).

**Tagline:** *"Speak. Build. Forge the Web with AI."*

## 🚀 Features

- **3D Animated Robot (AURA)** - Interactive 3D avatar with animations for idle, listening, and talking states
- **Voice Interaction** - Speech-to-text and text-to-speech using Web Speech API
- **Monaco Code Editor** - Professional code editing experience
- **Live Preview** - Real-time HTML preview in sandboxed iframe
- **Structured AI Commands** - AI returns JSON actions instead of random code generation
- **Constraint Engine** - Prevents unintended code changes
- **Terminal/Logs Panel** - Real-time activity logging

## 📁 Project Structure

```
VoxForge AI/
├── frontend/          # React (Vite) + Tailwind + Monaco + React Three Fiber
│   ├── src/
│   │   ├── components/
│   │   │   ├── Robot/      # AURA 3D robot component
│   │   │   ├── Chat/        # Chat panel with voice input
│   │   │   ├── Editor/      # Monaco code editor
│   │   │   ├── Preview/     # Live preview iframe
│   │   │   └── Terminal/    # Terminal/logs panel
│   │   └── store/           # Zustand state management
│   └── package.json
├── backend/           # FastAPI + AI agent
│   ├── routes/       # API endpoints
│   ├── ai_agent/     # AI agent modules
│   │   ├── intent_parser.py      # Converts prompts to JSON commands
│   │   ├── constraint_engine.py  # Validates commands
│   │   └── command_executor.py   # Executes commands
│   ├── main.py       # FastAPI app entry point
│   └── requirements.txt
└── .github/workflows/ # CI/CD workflows
```

## 🛠️ Setup

### Prerequisites

- Node.js 20.x or higher
- Python 3.11 or higher
- npm or yarn

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

### Backend Setup

**Windows:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Linux/Mac:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

## 🎯 Usage

1. Start both frontend and backend servers
2. Open `http://localhost:5173` in your browser
3. Interact with AURA using:
   - **Text commands**: Type in the chat panel
   - **Voice commands**: Click the microphone button 🎤
4. Try commands like:
   - "Change the background color to blue"
   - "Update the heading text to Welcome"
   - "Add a button"
   - "Make the text larger"

## 🤖 AI Command System

The AI agent uses a structured command system that returns JSON actions instead of generating full code:

```json
{
  "action": "update_style",
  "target": "body",
  "property": "background-color",
  "value": "#0000ff"
}
```

This prevents unintended changes and allows precise control over modifications.

## 🎨 Tech Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS 4
- Monaco Editor
- React Three Fiber (Three.js)
- Zustand
- Axios

**Backend:**
- FastAPI
- Python 3.11+
- Pydantic
- Uvicorn

## 📝 Development

### Running Tests

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
pytest  # (when tests are added)
```

### Building for Production

```bash
cd frontend
npm run build
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 🙏 Acknowledgments

- AURA - The AI Development Agent
- Built with ❤️ for the future of web development
