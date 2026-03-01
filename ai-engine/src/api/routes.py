import os
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import FileResponse
from typing import List, Optional, cast, Dict, Any
from pydantic import BaseModel

# Note: Update this import if your service is in src.services instead of src.core
from src.core.chat_service import ChatService 

# --- SCHEMAS ---
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    recommendations: List[str] = []
    intent: str = "general"
    file_url: Optional[str] = None # 🟢 FIX: Frontend expects file_url, not file_download

# 🟢 FIX: Add the prefix so the URLs match Next.js exactly
router = APIRouter(prefix="/api/v1/chat", tags=["Sarah AI"])
chat_service = ChatService()

# --- 1. WELCOME ENDPOINT (Used by useChat.js on load) ---
@router.get("/welcome", response_model=ChatResponse)
async def get_welcome(x_session_id: str = Header(...)):
    try:
        data = chat_service.get_welcome_package(x_session_id)
        
        return ChatResponse(
            response=cast(str, data.get("response", "")),
            recommendations=cast(List[str], data.get("recommendations", [])),
            intent=cast(str, data.get("intent", "welcome")),
            file_url=None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 2. CORE CHAT ENDPOINT (Used by Widget Send Button) ---
@router.post("/message", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, x_session_id: str = Header(...)):
    try:
        # 🟢 FIX: Extract session_id from Header to match frontend security
        result = chat_service.get_response(request.message, x_session_id)
        
        response_text = cast(str, result.get("response", ""))
        recommendations_list = cast(List[str], result.get("recommendations", []))
        intent_str = cast(str, result.get("intent", "general"))
        
        # 🟢 FIX: Format the file path for the frontend PDF button
        raw_download = cast(Optional[str], result.get("file_download"))
        file_url_str = f"/api/v1/chat/download/{raw_download}" if raw_download else None

        return ChatResponse(
            response=response_text,
            recommendations=recommendations_list,
            intent=intent_str,
            file_url=file_url_str
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 3. ANALYTICS ENDPOINT (Used by Admin Dashboard) ---
@router.get("/analytics", response_model=List[Dict[str, Any]])
async def get_analytics(limit: int = 50):
    try:
        # 🟢 FIX: This explicitly resolves the 404 on your dashboard
        return chat_service.get_all_history(limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 4. FILE SERVING ENDPOINT ---
@router.get("/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join("downloads", filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='application/pdf', filename=filename)
    raise HTTPException(status_code=404, detail="File not found")