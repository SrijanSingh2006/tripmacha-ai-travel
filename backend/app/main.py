import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes_chat, routes_scraping

app = FastAPI(
    title="TripMacha Core API",
    description="The centralized aggregator and AI routing engine.",
    version="1.0.0"
)

allowed_origins = [
    "http://localhost:5173",  
    "http://localhost:3000",  
    "https://trip-macha.vercel.app",       
    "https://trip-macha-q5j5.vercel.app"   
]

FRONTEND_URL = os.getenv("FRONTEND_URL")
if FRONTEND_URL and FRONTEND_URL not in allowed_origins:
    allowed_origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app", 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# THE FIX: Added /chat and /scrape back to the prefixes!
app.include_router(routes_chat.router, prefix="/api/chat", tags=["AI Co-Pilot"])
app.include_router(routes_scraping.router, prefix="/api/scrape", tags=["Task Queue"])

@app.get("/health")
def health_check():
    return {"status": "TripMacha Backend is online and ready."}