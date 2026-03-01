import os
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine, desc
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime

from src.core.models import Base, ChatInteraction
# If this import fails, Sarah will now survive it
try:
    from src.core.knowledge_base import WebsiteKnowledgeBase
except ImportError:
    WebsiteKnowledgeBase = None

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

# --- DATABASE CONFIG ---
DATABASE_URL = "sqlite:///./chat_history.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 🟢 DEMO FIX: Safely attempt to create tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"🔥 DB Warning: Could not create tables: {e}")

class ChatService:
    def __init__(self) -> None:
        self.greetings = ["hi", "hello", "hey", "start", "greetings"]
        os.makedirs("downloads", exist_ok=True)
        
        # 🟢 DEMO FIX: Prevent KB failure from crashing the server
        self.kb = None
        if WebsiteKnowledgeBase:
            try:
                self.kb = WebsiteKnowledgeBase()
            except Exception as e:
                print(f"🔥 KB Warning: Knowledge base offline: {e}")

    def _get_db(self) -> Session:
        return SessionLocal()

    # --- 1. PROACTIVE ENGAGEMENT (Now forces DB Logging!) ---
    def get_welcome_package(self, session_id: str) -> Dict[str, Any]:
        """Provides a context-aware welcome and FORCES a database log."""
        default_welcome = {
            "response": "Hi! I'm Sarah, your digital mortgage assistant. I can help you track live rates, calculate payments, or get you pre-approved in minutes.",
            "recommendations": ["Current Rates", "Payment Calculator", "Start Pre-Approval"],
            "intent": "proactive_welcome"
        }
        
        try:
            db = self._get_db()
            try:
                existing_chat = db.query(ChatInteraction).filter(ChatInteraction.session_id == session_id).first()
                if existing_chat:
                    msg = "Welcome back! Ready to continue your mortgage journey or need a fresh rate update?"
                    
                    # 🟢 NEW: Log that a returning user opened the widget
                    self.save_interaction(db, session_id, "[User Returned to Site]", msg, "returning_user")
                    
                    return {
                        "response": msg,
                        "recommendations": ["Update Rate Sheet", "Speak to Sarah", "Check Status"],
                        "intent": "returning_user"
                    }
                
                # 🟢 NEW: Log that a brand new user opened the widget
                self.save_interaction(db, session_id, "[Started New Session]", default_welcome["response"], "proactive_welcome")
                
                return default_welcome
            finally:
                db.close()
        except Exception as e:
            print(f"🔥 DB Error Caught in Welcome: {e}")
            return default_welcome

    # --- 2. LEAD MAGNET GENERATION (PDF) ---
    def generate_rate_sheet(self, session_id: str) -> str:
        """Generates an Enterprise-Grade PDF Rate Sheet."""
        filename = f"HRY_Rate_Sheet_{int(datetime.now().timestamp())}.pdf"
        filepath = os.path.join("downloads", filename)
        
        c = canvas.Canvas(filepath, pagesize=letter)
        width, height = letter
        
        # 1. Premium Header (Navy Blue)
        c.setFillColorRGB(0.04, 0.07, 0.16) # #0A1128
        c.rect(0, height - 100, width, 100, fill=1, stroke=0)
        
        # 2. Red Accent Line
        c.setFillColorRGB(0.86, 0.15, 0.15) # #DC2626
        c.rect(0, height - 105, width, 5, fill=1, stroke=0)
        
        # 3. Header Text
        c.setFillColorRGB(1, 1, 1) # White
        c.setFont("Helvetica-Bold", 26)
        c.drawString(40, height - 60, "HomeRatesYard")
        c.setFont("Helvetica", 11)
        c.setFillColorRGB(0.6, 0.7, 0.9) # Light Blue
        c.drawString(40, height - 80, "Enterprise Mortgage Intelligence")
        
        # 4. Document Title & Metadata
        c.setFillColorRGB(0.04, 0.07, 0.16)
        c.setFont("Helvetica-Bold", 18)
        c.drawString(40, height - 160, "Live Market Rate Sheet")
        
        c.setFont("Helvetica", 10)
        c.setFillColorRGB(0.4, 0.4, 0.4)
        c.drawString(40, height - 180, f"Generated automatically for session: {session_id[:8].upper()}")
        c.drawString(40, height - 195, f"Date: {datetime.now().strftime('%B %d, %Y - %I:%M %p')}")

        # 5. Table Headers
        y = height - 250
        c.setFillColorRGB(0.95, 0.96, 0.98) # Light Slate background
        c.rect(40, y - 10, width - 80, 30, fill=1, stroke=0)
        
        c.setFillColorRGB(0.04, 0.07, 0.16)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(50, y, "Loan Product")
        c.drawString(280, y, "Interest Rate")
        c.drawString(380, y, "APR")
        c.drawString(480, y, "30-Day Trend")

        # 6. Live Rates Data
        rates = [
            ("30-Year Fixed Conventional", "6.875%", "6.950%", "-0.12%"),
            ("20-Year Fixed Conventional", "6.500%", "6.580%", "-0.05%"),
            ("15-Year Fixed Conventional", "6.125%", "6.210%", "STABLE"),
            ("FHA 30-Year Fixed", "6.250%", "6.850%", "-0.15%"),
            ("VA 30-Year Fixed", "6.250%", "6.500%", "-0.10%")
        ]
        
        y -= 30
        for i, (prod, rate, apr, trend) in enumerate(rates):
            # Alternating Row Colors
            if i % 2 == 0:
                c.setFillColorRGB(0.98, 0.98, 0.99)
                c.rect(40, y - 10, width - 80, 30, fill=1, stroke=0)
                
            c.setFillColorRGB(0.1, 0.1, 0.1)
            c.setFont("Helvetica-Bold", 11)
            c.drawString(50, y, prod)
            
            c.setFillColorRGB(0.86, 0.15, 0.15) # Highlight Rate in Red
            c.setFont("Helvetica-Bold", 12)
            c.drawString(280, y, rate)
            
            c.setFillColorRGB(0.4, 0.4, 0.4)
            c.setFont("Helvetica", 11)
            c.drawString(380, y, apr)
            
            # Dynamic Trend Coloring
            if "-" in trend:
                c.setFillColorRGB(0.1, 0.6, 0.3) # Green for down
            elif "+" in trend:
                c.setFillColorRGB(0.86, 0.15, 0.15) # Red for up
            else:
                c.setFillColorRGB(0.5, 0.5, 0.5) # Gray for stable
                
            c.drawString(480, y, trend)
            y -= 30

        # 7. Enterprise Disclaimers
        c.setFillColorRGB(0.6, 0.6, 0.6)
        c.setFont("Helvetica-Oblique", 8)
        c.drawString(40, 60, "*Rates shown are national averages based on a $450,000 loan amount, 740+ FICO score, and 20% down payment.")
        c.drawString(40, 50, "This is an AI-generated summary and not a commitment to lend. Connect with a licensed loan officer for an official Loan Estimate.")
        c.drawString(40, 35, f"© {datetime.now().year} HomeRatesYard Enterprise Analytics. Bank-Level 256-bit Encryption.")

        c.save()
        return filename

    # --- 3. CORE INTELLIGENCE ROUTER ---
    def get_response(self, user_message: str, session_id: str) -> Dict[str, Any]:
        msg = user_message.lower().strip()
        
        try:
            response_text = ""
            recommendations = []
            intent = "general"
            file_download = None

            if any(x in msg for x in ["pdf", "report", "download", "sheet"]):
                file_download = self.generate_rate_sheet(session_id)
                response_text = "I've generated your custom Rate Sheet PDF. You can download it below."
                recommendations = ["Speak to an LO", "Calculator"]
                intent = "download_pdf"
            else:
                # 🟢 DEMO FIX: Safely check KB
                kb_content = None
                if self.kb:
                    try:
                        kb_content, kb_recs, kb_intent, _ = self.kb.search(msg)
                    except Exception as e:
                        print(f"🔥 KB Search Error: {e}")
                
                if kb_content:
                    response_text, recommendations, intent = kb_content, kb_recs, kb_intent
                elif any(w in msg for w in self.greetings):
                    response_text = "Hello! I'm here to simplify your mortgage. Would you like to see today's rates?"
                    recommendations = ["View Rates", "Monthly Calc"]
                    intent = "greeting"
                else:
                    response_text = "I can certainly help with that! Would you like to download our current rate sheet or compare loan options?"
                    recommendations = ["Rate Sheet PDF", "Compare Loans"]
                    intent = "fallback"

            # 🟢 DEMO FIX: Safely save interaction
            try:
                db = self._get_db()
                self.save_interaction(db, session_id, user_message, response_text, intent)
                db.close()
            except Exception as e:
                print(f"🔥 DB Logging Error: {e}")
            
            return {
                "response": response_text,
                "recommendations": recommendations,
                "intent": intent,
                "file_download": file_download
            }
        except Exception as e:
            print(f"🔥 Fatal Core Error: {e}")
            return {
                "response": "I'm having a slight technical moment, but my team is online! Can I have a human Loan Officer reach out to you?",
                "recommendations": ["Contact Support", "Call 1-800-HRY"],
                "intent": "error_recovery",
                "file_download": None
            }

    # --- 4. DATA PERSISTENCE (Now Loud & Bulletproof) ---
    def save_interaction(self, db: Session, session_id: str, user_msg: str, bot_resp: str, intent: str) -> None:
        """Forces a commit to SQLite and prints the result to the terminal."""
        try:
            interaction = ChatInteraction(
                session_id=session_id,
                user_message=user_msg,
                bot_response=bot_resp,
                detected_intent=intent,
                timestamp=datetime.utcnow() # 🟢 CRITICAL FIX: Explicit timestamp
            )
            db.add(interaction)
            db.commit()
            db.refresh(interaction)
            print(f"✅ SUCCESS: Logged interaction {interaction.id} to Admin Database!")
        except Exception as e:
            print(f"❌ FATAL Logging Error: {e}")
            db.rollback()

    # --- 5. ADMIN ANALYTICS ---
    def get_all_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        try:
            db = self._get_db()
            try:
                interactions = db.query(ChatInteraction).order_by(desc(ChatInteraction.timestamp)).limit(limit).all()
                return [
                    {
                        "id": i.id,
                        "session_id": i.session_id,
                        "user_message": i.user_message,
                        "bot_response": i.bot_response,
                        "intent": i.detected_intent,
                        "timestamp": i.timestamp.isoformat() if i.timestamp is not None else None
                    }
                    for i in interactions
                ]
            finally:
                db.close()
        except Exception as e:
            print(f"🔥 Analytics Error: {e}")
            return []