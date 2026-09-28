from app.scrapers.core_browser import get_stealth_browser_content
from app.agents.data_parser_agent import parse_html_to_json
from app.models.tour_schemas import ExtractedToursResult

async def scrape_veena_world_tours(destination: str) -> str:
    """
    Searches Veena World for tour packages and extracts them using GenAI.
    """
    url = f"https://www.veenaworld.com/search?q={destination}"
    
    # Veena World uses specific custom elements for their tour cards.
    # We tell Playwright to wait until these cards appear on the screen.
    raw_html = await get_stealth_browser_content(url, wait_for_selector="vw-tour-card, .tour-card-container")
    
    # Standardize their chaotic HTML into your strict Pydantic JSON schema
    clean_json = parse_html_to_json(raw_html, ExtractedToursResult)
    
    return clean_json