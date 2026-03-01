from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime, timezone

# FIX: Use the class-based definition for better Type Support in VS Code
class Base(DeclarativeBase):
    pass

class ChatInteraction(Base):
    __tablename__ = "chat_interactions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    user_message = Column(Text)
    bot_response = Column(Text)
    detected_intent = Column(String)
    
    # FIX: Use datetime.now(timezone.utc) strictly
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))