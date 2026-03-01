import os
from typing import List, Dict, Union, Optional
from sqlalchemy import create_engine, desc
from sqlalchemy.orm import sessionmaker, Session
from src.core.models import Base, ChatInteraction
from src.core.knowledge_base import WebsiteKnowledgeBase
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from datetime import datetime

DATABASE_URL = "sqlite:///./chat_history.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

class ChatService:
    def __init__(self) -> None:
        self.kb = WebsiteKnowledgeBase()
        self.db: Session = SessionLocal()
        self.greetings = ["hi", "hello", "hey", "start"]
        
        # Ensure 'downloads' folder exists
        os.makedirs("downloads", exist_ok=True)

    def get_session_history(self, session_id: str, limit: int = 3) -> List[ChatInteraction]:
        return self.db.query(ChatInteraction)\
            .filter(ChatInteraction.session_id == session_id)\
            .order_by(desc(ChatInteraction.timestamp))\
            .limit(limit)\
            .all()

    def generate_rate_sheet(self, session_id: str) -> str:
        """Generates a simple PDF and returns the filename."""
        filename = f"Rate_Sheet_{session_id}_{int(datetime.now().timestamp())}.pdf"
        filepath = os.path.join("downloads", filename)
        
        c = canvas.Canvas(filepath, pagesize=letter)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(100, 750, "HomeRatesYard - Official Rate Sheet")
        c.setFont("Helvetica", 12)
        c.drawString(100, 730, f"Generated for Session: {session_id}")
        c.drawString(100, 710, f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        c.line(100, 700, 500, 700)
        
        y = 650
        rates = [
            ("30-Year Fixed", "6.12%", "APR 6.25%"),
            ("15-Year Fixed", "5.85%", "APR 5.99%"),
            ("FHA 30-Year", "5.75%", "APR 6.60%"),
            ("VA 30-Year", "5.75%", "APR 5.90%")
        ]
        
        c.drawString(100, 670, "Product")
        c.drawString(300, 670, "Rate")
        c.drawString(400, 670, "APR")
        
        for product, rate, apr in rates:
            c.drawString(100, y, product)
            c.drawString(300, y, rate)
            c.drawString(400, y, apr)
            y -= 30
            
        c.drawString(100, y-50, "Contact us at 1-800-555-0199 to lock this rate.")
        c.save()
        return filename

    # FIX: Updated return type to include Optional[str] for file_download
    def get_response(self, user_message: str, session_id: str) -> Dict[str, Union[str, List[str], Optional[str]]]:
        msg = user_message.lower().strip()
        history = self.get_session_history(session_id)
        
        response_text = ""
        recommendations = []
        intent = "general"
        file_download = None

        # 1. Check Specific Advanced Triggers
        if "pdf" in msg or "report" in msg or "summary" in msg:
            pdf_file = self.generate_rate_sheet(session_id)
            response_text = "I've generated a personalized Rate Sheet PDF for you. You can download it below."
            recommendations = ["Book a Call", "Ask another question"]
            intent = "download_pdf"
            file_download = pdf_file

        elif "book" in msg or "call" in msg or "schedule" in msg:
            response_text = "I can definitely help with that. Please select a time slot from the calendar below to speak with a Senior Loan Officer."
            recommendations = ["Morning", "Afternoon"]
            intent = "scheduler"
            
        else:
            # Standard Logic
            kb_content, kb_recs, kb_intent, _ = self.kb.search(msg)
            
            if kb_content:
                response_text = kb_content
                recommendations = kb_recs
                intent = kb_intent
            elif any(w in msg for w in self.greetings):
                response_text = "Hello! I'm Sarah. I can generate rate reports, schedule calls, or answer loan questions."
                recommendations = ["Download Rate PDF", "Book a Call", "Check Rates"]
                intent = "greeting"
            else:
                # FIX: Used 'history' variable here to satisfy the checker
                if history and "rate" in str(history[0].user_message).lower():
                    response_text = "I see you were asking about rates earlier. Would you like a PDF summary instead?"
                    recommendations = ["Yes, PDF Report", "No, thanks"]
                else:
                    response_text = "I can help with Rates, PDF Reports, or Booking calls. Try asking for a 'Rate Sheet PDF'."
                    recommendations = ["Get PDF Report", "Book Appointment"]
                intent = "fallback"

        self.save_interaction(session_id, user_message, response_text, intent)

        return {
            "response": response_text,
            "recommendations": recommendations,
            "intent": intent,
            "file_download": file_download
        }

    def save_interaction(self, session_id: str, user_msg: str, bot_resp: str, intent: str) -> None:
        try:
            interaction = ChatInteraction(
                session_id=session_id,
                user_message=user_msg,
                bot_response=bot_resp,
                detected_intent=intent
            )
            self.db.add(interaction)
            self.db.commit()
        except Exception:
            self.db.rollback()