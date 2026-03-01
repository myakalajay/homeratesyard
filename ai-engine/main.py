import uvicorn
import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# 🟢 PATH INJECTION: Standard for Docker/Local hybrid environments
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

# 🟢 CRITICAL IMPORT FIX: 
# Ensure this matches your actual filename (chat_controller.py OR routes.py)
try:
    from src.api.chat_controller import router as chat_router
    # If you renamed it to routes.py, use this instead:
    # from src.api.routes import router as chat_router
except ImportError as e:
    print(f"FATAL: Internal module resolution failed. Check your __init__.py files. Error: {e}")
    sys.exit(1)

app = FastAPI(
    title="HomeRatesYard AI Engine", 
    version="2.0.0",
    description="Sarah AI - Enterprise Mortgage Intelligence Platform"
)

# --- 1. CORS CONFIGURATION ---
# PO Note: We allow all origins for dev. 
# In production, this should be restricted to ['http://localhost:3000', 'https://homeratesyard.com']
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"], # 🟢 IMPORTANT: Allows frontend to read custom file headers
)

# --- 2. STATIC FILE SERVING (Sarah's PDFs) ---
DOWNLOADS_DIR = os.path.join(BASE_DIR, "downloads")
if not os.path.exists(DOWNLOADS_DIR):
    os.makedirs(DOWNLOADS_DIR)

# 🟢 PDF ARCHITECTURE: This correctly mounts the folder so the React widget's 
# `file_url` pointing to `/downloads/...` will serve the PDF directly.
app.mount("/downloads", StaticFiles(directory=DOWNLOADS_DIR), name="downloads")

# --- 3. HEALTH & DIAGNOSTICS ---
@app.get("/", tags=["Health"])
async def health_check():
    return {
        "status": "Online",
        "service": "Sarah AI Engine",
        "timestamp": os.popen('date').read().strip() if os.name != 'nt' else "Windows-Active",
        "storage_check": "Ready" if os.path.exists(DOWNLOADS_DIR) else "Storage Error"
    }

# --- 4. ROUTES ---
app.include_router(chat_router)

if __name__ == "__main__":
    # Host 0.0.0.0 is essential for Docker compatibility later
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)