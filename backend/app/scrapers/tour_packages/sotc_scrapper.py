from app.scrapers.core_browser import get_stealth_browser_content
from app.agents.data_parser_agent import parse_html_to_json
from app.models.tour_schemas import ExtractedToursResult

async def scrape_sotc_tours(destination: str) -> str:
    """
    Searches SOTC for tour packages and extracts them using GenAI.
    """
    # SOTC uses hyphenated destination routes (e.g., /kerala-tour-packages)
    formatted_dest = destination.lower().replace(" ", "-")
    url = f"https://www.sotc.in/{formatted_dest}-tour-packages"
    
    # Grab the raw HTML using the stealth browser
    # Wait for the main listing container to ensure JavaScript has loaded the deals
    raw_html = await get_stealth_browser_content(url, wait_for_selector=".package-card, .listingCard")
    
    # Let Gemini do the heavy lifting of extracting the inclusions and price
    clean_json = parse_html_to_json(raw_html, ExtractedToursResult)
    
    return clean_json