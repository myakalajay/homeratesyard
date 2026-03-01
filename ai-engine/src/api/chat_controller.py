from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
import os

from src.services.chat_service import ChatService

# 🟢 INITIALIZE ROUTER & SERVICE
router = APIRouter(prefix="/api/v1/chat", tags=["Sarah AI Assistant"])
chat_service = ChatService()

# --- PYDANTIC SCHEMAS ---
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    recommendations: List[str]
    intent: str
    file_url: Optional[str] = None

# --- 1. PROACTIVE WELCOME (Triggered on Widget Open) ---
@router.get("/welcome", response_model=ChatResponse)
async def get_welcome(x_session_id: str = Header(...)) -> ChatResponse:
    try:
        data = chat_service.get_welcome_package(x_session_id)
        return ChatResponse(
            response=str(data["response"]),
            recommendations=list(data["recommendations"]),
            intent=str(data["intent"])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 2. MESSAGE PROCESSING (The Core Intelligence) ---
@router.post("/message", response_model=ChatResponse)
async def post_message(request: ChatRequest, x_session_id: str = Header(...)) -> ChatResponse:
    try:
        result = chat_service.get_response(request.message, x_session_id)
        
        # Format the file URL strictly for static serving if a PDF was generated
        file_url = f"/downloads/{result['file_download']}" if result.get("file_download") else None

        return ChatResponse(
            response=str(result["response"]),
            recommendations=list(result["recommendations"]),
            intent=str(result["intent"]),
            file_url=file_url
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 3. ADMIN ANALYTICS (🟢 NEW: Resolves the 404 Error) ---
@router.get("/analytics", response_model=List[Dict[str, Any]])
async def get_analytics(limit: int = 50) -> List[Dict[str, Any]]:
    """
    BA View: Returns the latest chat interactions for the Next.js Admin Dashboard.
    This strictly returns the serialized list of dictionary objects.
    """
    try:
        history = chat_service.get_all_history(limit=limit)
        return history
    except Exception as e:
        print(f"Analytics Route Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")