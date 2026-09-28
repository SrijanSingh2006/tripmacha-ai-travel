from app.scrapers.core_browser import get_stealth_browser_content
from app.agents.data_parser_agent import parse_html_to_json
from app.models.diy_schemas import ExtractedFlightsResult

async def scrape_direct_airline(origin_code: str, dest_code: str, date_str: str) -> str:
    """
    Directly scrapes an Indian airline for base fares.
    Airlines have aggressive bot protection; stealth is critical here.
    """
    # Example URL structure for a direct airline search (e.g., IndiGo)
    url = f"https://www.goindigo.in/booking/flight-select.html?or={origin_code}&dx={dest_code}&dd={date_str}"
    
    # We must wait for the actual flight prices to load, as they are fetched asynchronously
    raw_html = await get_stealth_browser_content(url, wait_for_selector=".flight-details, .info-row")
    
    # Gemini takes the massive wall of text and pulls out just the airline name, time, and price
    clean_json = parse_html_to_json(raw_html, ExtractedFlightsResult)
    
    return clean_json