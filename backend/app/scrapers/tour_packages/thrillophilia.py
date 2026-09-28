from app.scrapers.core_browser import get_stealth_browser_content
from app.agents.data_parser_agent import parse_html_to_json
from app.models.tour_schemas import ExtractedToursResult

async def scrape_thrillophilia_tours(destination: str) -> str:
    """
    Searches Thrillophilia for packages and extracts them using GenAI.
    """
    # 1. Format the target URL
    formatted_dest = destination.lower().replace(" ", "-")
    url = f"https://www.thrillophilia.com/destinations/{formatted_dest}/tours"
    
    # 2. Grab the raw HTML using your stealth browser
    raw_html = await get_stealth_browser_content(url)
    
    # 3. Pass the messy HTML to Gemini to extract the TourPackage schema
    clean_json = parse_html_to_json(raw_html, ExtractedToursResult)
    
    return clean_json