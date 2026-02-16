from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from routes import agent_routes
import json

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

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

# Include routes
app.include_router(agent_routes.router, prefix="/api/agent", tags=["agent"])

@app.get("/")
async def root():
    return {"message": "VoxForge AI Backend API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "connections": len(manager.active_connections)}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await manager.send_personal_message({
            "type": "connection",
            "message": "Connected to AURA",
            "status": "connected"
        }, websocket)
        
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data.get("type") == "command":
                # Process command through agent
                from ai_agent.intent_parser import IntentParser
                from ai_agent.constraint_engine import ConstraintEngine
                
                prompt = message_data.get("prompt", "")
                context = message_data.get("context", {})
                
                # Parse intent
                intent_parser = IntentParser()
                intent = intent_parser.parse(prompt, context)
                
                # Validate constraints
                constraint_engine = ConstraintEngine()
                validated_commands = constraint_engine.validate(intent.commands, context)
                
                # Send thinking state
                await manager.send_personal_message({
                    "type": "state",
                    "state": "thinking",
                    "message": "Processing your request..."
                }, websocket)
                
                # Send executing state
                await manager.send_personal_message({
                    "type": "state",
                    "state": "executing",
                    "message": f"Executing {len(validated_commands)} command(s)..."
                }, websocket)
                
                # Send commands
                await manager.send_personal_message({
                    "type": "commands",
                    "commands": validated_commands,
                    "response": f"I'll {intent.action} for you. Executing {len(validated_commands)} command(s)."
                }, websocket)
                
                # Send talking state
                await manager.send_personal_message({
                    "type": "state",
                    "state": "talking",
                    "message": "Responding..."
                }, websocket)
                
                # Send completion
                await manager.send_personal_message({
                    "type": "complete",
                    "state": "idle",
                    "message": "Ready"
                }, websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast({
            "type": "disconnect",
            "message": "Client disconnected"
        })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
