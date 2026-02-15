# VoxForge AI

**A Futuristic Conversational AI IDE with 3D Interactive Voice Robot for Live Web Development**

VoxForge AI is a web-based AI development environment where users can build and modify websites using voice and text instructions through a 3D animated robot agent (**AURA**).

**Tagline:** *"Speak. Build. Forge the Web with AI."*

## Structure

- `frontend/` — React (Vite) + Tailwind + Monaco + React Three Fiber (AURA 3D)
- `backend/` — FastAPI + AI agent (intent parser, constraint engine, command executor)

## Setup

**Frontend**
```bash
cd frontend && npm install && npm run dev
```

**Backend**
```bash
cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && uvicorn main:app --reload
```

## License

MIT
