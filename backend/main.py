from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import agent_routes

app = FastAPI(
    title="VoxForge AI Backend",
    description="AI Development Agent API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(agent_routes.router, prefix="/api/agent", tags=["agent"])

@app.get("/")
async def root():
    return {"message": "VoxForge AI Backend API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
