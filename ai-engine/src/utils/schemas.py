from pydantic import BaseModel
from typing import List

class ChatRequest(BaseModel):
    message: str
    session_id: str = "guest"  # Critical for tracking user history

class ChatResponse(BaseModel):
    response: str
    recommendations: List[str] = []  # Critical for "Smart Suggestions"