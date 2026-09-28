from google import genai
from app.core.config import settings
from app.core.prompts import SYSTEM_CO_PILOT_PROMPT

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def generate_chat_response(user_prompt: str, history: list) -> str:
    """
    Handles the natural language chat with the user.
    """
    # Format history for the Gemini model
    formatted_history = [{"role": msg.role, "parts": [{"text": msg.text}]} for msg in history]
    
    # Add the current prompt
    formatted_history.append({"role": "user", "parts": [{"text": f"{SYSTEM_CO_PILOT_PROMPT}\n\nUser: {user_prompt}"}]})
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=formatted_history
        )
        return response.text
    except Exception as e:
        return "I am currently experiencing turbulence connecting to my servers. Give me a moment!"