from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from ai_agent.intent_parser import IntentParser
from ai_agent.constraint_engine import ConstraintEngine
from ai_agent.command_executor import CommandExecutor

router = APIRouter()

class CommandRequest(BaseModel):
    prompt: str
    context: Optional[Dict[str, Any]] = None

class CommandResponse(BaseModel):
    response: str
    commands: List[Dict[str, Any]]

@router.post("/command", response_model=CommandResponse)
async def process_command(request: CommandRequest):
    """
    Process user command and return structured JSON actions
    """
    try:
        # Parse intent
        intent_parser = IntentParser()
        intent = intent_parser.parse(request.prompt, request.context)
        
        # Validate constraints
        constraint_engine = ConstraintEngine()
        validated_commands = constraint_engine.validate(intent.commands, request.context)
        
        # Generate response
        response_text = f"I'll {intent.action} for you. Executing {len(validated_commands)} command(s)."
        
        return CommandResponse(
            response=response_text,
            commands=validated_commands
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status():
    return {"status": "active", "agent": "AURA"}
