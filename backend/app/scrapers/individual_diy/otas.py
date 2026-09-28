from app.scrapers.core_browser import get_stealth_browser_content
from app.agents.data_parser_agent import parse_html_to_json
from app.models.diy_schemas import ExtractedFlightsResult

async def scrape_ota_flights(origin_code: str, dest_code: str, date_str: str) -> str:
    """
    Scrapes an OTA like Cleartrip for flight data.
    """
    # Example URL structure for Cleartrip:
    url = f"https://www.cleartrip.com/flights/results?from={origin_code}&to={dest_code}&depart_date={date_str}"
    
    # OTAs use React/Angular. We MUST wait for the flight cards to render.
    # The selector '.listingCard' or similar will need to be inspected by Team 3.
    raw_html = await get_stealth_browser_content(url, wait_for_selector="div[data-test-attrib='flight-card']")
    
    # Let Gemini figure out the prices and airlines
    clean_json = parse_html_to_json(raw_html, ExtractedFlightsResult)
    
    return clean_json