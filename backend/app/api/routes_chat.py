from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import os
import json
from datetime import datetime
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
router = APIRouter()

try:
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
except Exception as e:
    print(f"Warning: Gemini API Key not found or invalid. {e}")

class ChatRequest(BaseModel):
    prompt: str
    history: list = []

# 1. The Blueprint: This forces the AI to output exactly what the frontend needs
class AIIntentResponse(BaseModel):
    chat_reply: str = Field(description="A friendly response and a 3-day travel itinerary based on the user's destination.")
    airport_code: str = Field(description="The standard 3-letter IATA airport code for the requested destination (e.g., GOI for Goa, KUU for Manali/Kullu, BOM for Mumbai).")
    search_date: str = Field(description="A future travel date in YYYY-MM-DD format (assume roughly a month from now).")

@router.post("")
async def process_user_intent(request: ChatRequest):
    # Grab today's real date from the operating system
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    # Inject it into the prompt!
    system_instruction = f"""
    You are TripMacha, an AI travel assistant. 
    Today's actual date is {current_date}. 
    Read the user's prompt, figure out where they want to go, and generate a brief, exciting 3-day itinerary. 
    Simultaneously, extract the correct 3-letter airport code and a future date (at least 3 weeks from today) so our flight scrapers can run.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"User says: {request.prompt}",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=AIIntentResponse, # Forces Gemini to return JSON matching the blueprint
                temperature=0.7
            )
        )
        
        # Parse the guaranteed JSON string from Gemini and send it to React
        structured_data = json.loads(response.text)
        return structured_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))