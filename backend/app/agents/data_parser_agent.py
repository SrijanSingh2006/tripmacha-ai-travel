# from google import genai
# from google.genai import types
# from google.genai.errors import APIError
# from pydantic import BaseModel
# from app.core.config import settings

# client = genai.Client(api_key=settings.GEMINI_API_KEY)

# def parse_html_to_json(raw_html: str, schema: BaseModel, search_context: str = "") -> str:
#     """
#     Feeds raw scraped HTML to Gemini. Now includes search_context to force the AI 
#     to filter deals specifically for the user's requested destination and time period.
#     """
    
#     system_instruction = f"""
#     You are an elite travel data metasearch aggregator.
#     You will be provided with raw structured text or HTML data blocks from Indian travel platforms.
    
#     CRITICAL CONTEXT FOR THIS SEARCH: 
#     {search_context}
    
#     Your operational parameters:
#     1. Scan the text to find real travel options specifically matching the destination and dates above.
#     2. Extract the EXACT title of the tour package, hotel, or flight (e.g. '6 Days Magical Goa Tour'). Do NOT use generic summaries like 'Multi-day Tour'.
#     3. Cleanly deduplicate identical options.
#     4. Format and structure your findings perfectly to fit the specified JSON response schema.
#     """

#     prompt = f"""
#     Analyze the following raw comparison data block. Extract the relevant travel deals matching the search context and format them strictly into the requested schema structure.

#     RAW SECURED TRAVEL DATA:
#     {raw_html[:150000]}
#     """

#     try:
#         response = client.models.generate_content(
#             model='gemini-2.5-flash',
#             contents=prompt,
#             config=types.GenerateContentConfig(
#                 system_instruction=system_instruction,
#                 response_mime_type='application/json',
#                 response_schema=schema,
#                 temperature=0.1
#             )
#         )
#         return response.text
#     except APIError as e:
#         # Check both numerical status codes and string status codes for 429/503 limits
#         error_code = getattr(e, 'code', None)
#         error_status = str(getattr(e, 'status', '')).upper()
        
#         if error_code in [429, 503] or "UNAVAILABLE" in error_status or "RESOURCE_EXHAUSTED" in error_status:
#             raise e
            
#         # Fallback for permanent errors (e.g., 400 Bad Request, Invalid Argument)
#         return f'{{"error": "Unrecoverable API Error: {str(e)}"}}'
#     except Exception as e:
#         return f'{{"error": "Failed to parse data: {str(e)}"}}'


from google import genai
from google.genai import types
from google.genai.errors import APIError
from pydantic import BaseModel
from app.core.config import settings
import re
from bs4 import BeautifulSoup

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def clean_junk_html(html: str) -> str:
    """Strips massive hidden blocks from HTML to save LLM tokens."""
    if not html:
        return ""
    soup = BeautifulSoup(html, "html.parser")
    
    # Destroy invisible/junk elements completely
    for element in soup(["head", "script", "style", "svg", "noscript", "footer", "iframe", "header", "nav"]):
        element.extract()
    
    # Extract only the raw text, separated by spaces
    pure_text = soup.get_text(separator=" | ", strip=True)
    
    # Compress repeating layout separators to save string space
    pure_text = re.sub(r'(\s*\|\s*)+', ' | ', pure_text)
    return pure_text

def parse_html_to_json(raw_html: str, schema: BaseModel, search_context: str = "") -> str:
    """
    Feeds processed text blocks to Gemini. Incorporates explicit HTML parsing cleanup
    and active architecture separation protocols.
    """
    
    # Pre-parse and clean layout noise before building payload window
    cleaned_html = clean_junk_html(raw_html)
    
    # =====================================================================
    # 🧠 DYNAMIC AI ISOLATION LOGIC
    # Prevents the AI from hallucinating DIY packages when doing Tours
    # =====================================================================
    if "DIY TRIP ASSEMBLY" in search_context:
        mode_specific_rules = """
        6. DIY ASSEMBLY PROTOCOL:
           - Combine relevant flights, hotels, and transport sections into 3 distinct cohesive 'Assembled Trip Options'.
           - ALL options MUST strictly align with the requested budget tier. Provide multiple variations within that same tier.
           - Map the custom combo name to 'airline' (e.g., 'Budget Option 1: Backpacker Flex').
           - Map the total travel duration to 'departure_time' (e.g., '4 Days / 3 Nights').
           - Sum the cumulative total costs and place that value inside 'price'.
           - You MUST populate the 'itinerary' array by listing the 3 booked components FIRST, followed immediately by a realistic Day-by-Day travel itinerary for the destination.
        """
    else:
        mode_specific_rules = """
        6. PRE-MADE TOURS PROTOCOL (STRICT):
           - DO NOT assemble custom or DIY packages. You must extract the EXACT pre-made holiday packages listed by the operator (e.g., Thomas Cook, Thrillophilia).
           - Look deeply in the text for accordion-style or hidden itineraries (e.g., 'Day 1: Arrival', 'Day 2: Exploration').
           - If you find this day-by-day structural data, extract it EXACTLY into the 'itinerary' array. 
           - If the day-by-day itinerary is completely missing from the HTML text, you MUST generate a realistic, highly-structured Day-by-Day itinerary that matches the extracted package highlights and duration.
        """

    system_instruction = f"""
    You are an elite travel data metasearch aggregator and itinerary planner.
    You will be provided with raw structured text or HTML data blocks from Indian travel platforms.
    
    CRITICAL CONTEXT & USER CONSTRAINTS: 
    {search_context}
    
    Your operational parameters:
    1. Scan the text to find real travel options specifically matching the destination and dates above.
    2. STRICT BUDGET ENFORCEMENT: If the user requested a specific budget tier in the context, ALL options you return must strictly align with this single tier.
    3. DURATION MATCHING: For hotels and trips, ensure the extracted price aligns with the requested trip duration.
    4. Extract the EXACT title of the tour package, hotel, or flight. Do NOT use generic summaries.
    5. Cleanly deduplicate identical options.
    
    {mode_specific_rules}

    7. Format and structure your findings perfectly to fit the specified JSON response schema.
    """

    prompt = f"""
    Analyze the following raw comparison data block. Extract the relevant travel deals matching the search context and format them strictly into the requested schema structure.

    RAW SECURED TRAVEL DATA:
    {cleaned_html[:150000]}
    """

    # =====================================================================
    # 🚀 DEBUG PRINT: OUTGOING PROMPT AND CONFIG DATA
    # =====================================================================
    print("\n" + "="*50)
    print("🚀 GEMINI API CALL: OUTGOING PROMPT DETAILS 🚀")
    print("="*50)
    print(f"SEARCH CONTEXT: {search_context}")
    print(f"SCHEMA TARGET : {schema.__name__ if hasattr(schema, '__name__') else type(schema)}")
    print(f"TOTAL HTML LENGTH PASSED: {len(raw_html)} characters")
    print(f"CLEANED TEXT LENGTH: {len(cleaned_html)} characters")
    print(f"TEXT LENGTH USED (TRUNCATION LIMIT): {len(cleaned_html[:150000])} characters")
    print("\n--- SYSTEM INSTRUCTION ---")
    print(system_instruction.strip())
    print("\n--- PROMPT SNIPPET (First 500 chars) ---")
    print(f"{prompt[:500].strip()}...")
    print("="*50 + "\n")

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type='application/json',
                response_schema=schema,
                temperature=0.2 
            )
        )
        
        # =====================================================================
        # 📥 DEBUG PRINT: RAW INCOMING JSON RESPONSE
        # =====================================================================
        print("\n" + "="*50)
        print("📥 GEMINI API CALL: RAW JSON RESPONSE 📥")
        print("="*50)
        print(response.text)
        print("="*50 + "\n")
        
        return response.text
        
    except APIError as e:
        error_code = getattr(e, 'code', None)
        error_status = str(getattr(e, 'status', '')).upper()
        
        print(f"\n[⚠️ APIError caught] Code: {error_code} | Status: {error_status}")
        
        if error_code in [429, 503] or "UNAVAILABLE" in error_status or "RESOURCE_EXHAUSTED" in error_status:
            raise e
            
        return f'{{"error": "Unrecoverable API Error: {str(e)}"}}'
    except Exception as e:
        print(f"\n[❌ Unexpected Exception caught]: {str(e)}")
        return f'{{"error": "Failed to parse data: {str(e)}"}}'