from app.workers.celery_app import celery_app
import asyncio
from datetime import datetime, timedelta
from pydantic import BaseModel, Field, ConfigDict
from google.genai.errors import APIError
from app.scrapers.core_browser import get_stealth_browser_content
from app.agents.data_parser_agent import parse_html_to_json

# ==========================================
# 1. THE UNIVERSAL AI BLUEPRINT (STRICT MODE)
# ==========================================
class LiveDeal(BaseModel):
    airline: str = Field(
        description="The provider and item title. For flights: airline name and code (e.g., 'IndiGo 6E-123'). For hotels: hotel name (e.g., 'Taj Exotica Resort'). For tours: operator and package name (e.g., 'Thomas Cook - 5 Days Goa Tour')."
    )
    departure_time: str = Field(
        description="Timing or duration marker. For flights: departure time (e.g., '10:00 AM'). For hotels: check-in info (e.g., 'Check-in: 2 PM'). For tours: total length (e.g., '4 Nights / 5 Days')."
    )
    arrival_time: str = Field(
        description="Ending marker or package highlights. For flights: arrival time (e.g., '12:30 PM'). For hotels: check-out info (e.g., 'Check-out: 11 AM'). For tours: primary inclusions (e.g., 'Flights + 4-Star Hotel + Sightseeing')."
    )
    price: str = Field(
        description="The total price string inclusive of taxes in INR (e.g., '₹34,500'). Extract the lowest available rate found."
    )
    link: str = Field(
        default="", 
        description="The direct booking URL or deep link to this specific deal on the provider's website. If a deep link is completely hidden, you MUST provide the base domain (e.g., 'https://www.makemytrip.com')."
    )
    itinerary: list[str] = Field(
        default=[], 
        description="List of package highlights, destinations covered, or day-by-day plans. MUST be populated for tours. (e.g., ['Sightseeing in North Goa', 'Visit to Fort Aguada'] or ['Day 1: Arrival', 'Day 2: Beach']). Leave empty for flights, hotels, trains, buses, and cabs."
    )

class ExtractedDealsResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    destination: str = Field(
        description="The targeted region or route context (e.g., 'Goa Holiday Deals', 'Mumbai Hotels', 'BLR to BOM Flights')."
    )
    
    deals: list[LiveDeal] = Field(
        serialization_alias="flights",
        description="A list of the extracted travel deals, options, packages, or listings found on the page."
    )


# ==========================================
# 2. UTILITY & LOCATION RESOLVERS
# ==========================================
def format_dates(date_str: str):
    """Normalizes cross-platform parsing anomalies for temporal queries."""
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d")
        return {
            "iso": date_str, "mmt": d.strftime("%d/%m/%Y"),
            "dash": d.strftime("%d-%m-%Y"), "flat": d.strftime("%Y%m%d"), "sky": d.strftime("%y%m%d")
        }
    except ValueError:
        return {"iso": date_str, "mmt": date_str, "dash": date_str, "flat": date_str, "sky": date_str}

def get_location_codes(location_string: str):
    """
    Translates messy user input into strict IATA codes (for flights) 
    and full city names (for tours/hotels).
    """
    loc_map = {
        "mumbai": ("BOM", "mumbai"), "bom": ("BOM", "mumbai"), "bombay": ("BOM", "mumbai"),
        "delhi": ("DEL", "new-delhi"), "new delhi": ("DEL", "new-delhi"), "del": ("DEL", "new-delhi"),
        "bengaluru": ("BLR", "bengaluru"), "bangalore": ("BLR", "bengaluru"), "blr": ("BLR", "bengaluru"),
        "goa": ("GOI", "goa"), "goi": ("GOI", "goa"), "gox": ("GOX", "goa"),
        "chennai": ("MAA", "chennai"), "maa": ("MAA", "chennai"), "madras": ("MAA", "chennai"),
        "kolkata": ("CCU", "kolkata"), "ccu": ("CCU", "kolkata"), "calcutta": ("CCU", "kolkata"),
        "hyderabad": ("HYD", "hyderabad"), "hyd": ("HYD", "hyderabad"),
        "pune": ("PNQ", "pune"), "pnq": ("PNQ", "pune"),
        "jaipur": ("JAI", "jaipur"), "jai": ("JAI", "jaipur"),
        "ahmedabad": ("AMD", "ahmedabad"), "amd": ("AMD", "ahmedabad"),
        "kochi": ("COK", "kochi"), "cok": ("COK", "kochi"), "cochin": ("COK", "kochi"),
        "kanpur": ("KNU", "kanpur"), "knu": ("KNU", "kanpur"),
        "manali": ("KUU", "manali"), "kuu": ("KUU", "manali"), 
        "kashmir": ("SXR", "kashmir"), "srinagar": ("SXR", "srinagar"), "sxr": ("SXR", "srinagar"),
        "kerala": ("TRV", "kerala"),
        "andaman": ("IXZ", "andaman"), 
        "andaman nicobar": ("IXZ", "andaman"), 
        "andaman nicobar islands": ("IXZ", "andaman"),
        "dubai": ("DXB", "dubai"),
        "bali": ("DPS", "bali"),
        "thailand": ("BKK", "thailand"),
        "sri lanka": ("CMB", "sri-lanka")
    }
    
    cleaned = str(location_string).lower().strip()
    
    if cleaned in loc_map:
        return loc_map[cleaned]
    
    if len(cleaned) == 3:
        return (location_string.upper(), location_string.lower())
    else:
        safe_city = cleaned.replace(" ", "-")
        fake_iata = cleaned[:3].upper() if len(cleaned) >= 3 else "DEL"
        return (fake_iata, safe_city)


def fetch_all_html(targets: list) -> str:
    """Orchestrates parallel Playwright execution loops for aggressive speed optimization."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    scraping_tasks = [get_stealth_browser_content(t["url"]) for t in targets]
    results = loop.run_until_complete(asyncio.gather(*scraping_tasks, return_exceptions=True))
    loop.close()
    
    combined_html = ""
    for idx, html in enumerate(results):
        if not isinstance(html, Exception) and html:
            combined_html += f"\n--- DATA FROM SOURCE PROVIDER: {targets[idx]['provider']} ---\n{html}"
    return combined_html


# ==========================================
# 3. METASEARCH TARGET GENERATORS
# ==========================================
def get_flight_urls(origin, destination, date):
    orig_iata, _ = get_location_codes(origin)
    dest_iata, _ = get_location_codes(destination)
    d = format_dates(date)
    return [
        {"provider": "MakeMyTrip Flights", "url": f"https://www.makemytrip.com/flight/search?itinerary={orig_iata}-{dest_iata}-{d['mmt']}&tripType=O&paxType=A-1_C-0_I-0&cabinClass=E"},
        {"provider": "Kayak Flights", "url": f"https://www.kayak.co.in/flights/{orig_iata}-{dest_iata}/{d['iso']}?sort=price_a"},
        {"provider": "Cleartrip Flights", "url": f"https://www.cleartrip.com/flights/results?from={orig_iata}&to={dest_iata}&depart_date={d['mmt']}&adults=1&childs=0&infants=0&class=Economy"}
    ]

def get_hotel_urls(city, checkin, checkout, guests):
    _, dest_city = get_location_codes(city)
    cin = format_dates(checkin)
    cout = format_dates(checkout)
    return [
        {"provider": "Cleartrip Hotels", "url": f"https://www.cleartrip.com/hotels/results?city={dest_city}&checkIn={cin['iso']}&checkOut={cout['iso']}&adults={guests}"},
        {"provider": "Booking Com", "url": f"https://www.booking.com/searchresults.html?ss={dest_city}&checkin={cin['iso']}&checkout={cout['iso']}&group_adults={guests}"}
    ]

def get_train_urls(origin, destination, date):
    _, orig_city = get_location_codes(origin)
    _, dest_city = get_location_codes(destination)
    d = format_dates(date)
    return [
        {"provider": "ConfirmTkt Engine", "url": f"https://www.confirmtkt.com/train-tickets/{orig_city}-to-{dest_city}/?date={d['dash']}"}
    ]

def get_bus_urls(origin, destination, date):
    _, orig_city = get_location_codes(origin)
    _, dest_city = get_location_codes(destination)
    d = format_dates(date)
    return [
        {"provider": "RedBus Portal", "url": f"https://www.redbus.in/bus-tickets/{orig_city}-to-{dest_city}?doj={d['dash']}"}
    ]

def get_cab_urls(origin, destination, date):
    _, orig_city = get_location_codes(origin)
    _, dest_city = get_location_codes(destination)
    return [
        {"provider": "MakeMyTrip Cabs", "url": f"https://www.makemytrip.com/cabs/{orig_city}-to-{dest_city}-cab-booking.html"},
        {"provider": "Goibibo Cabs", "url": f"https://www.goibibo.com/cars/cab-from-{orig_city}/"}
    ]

def get_tour_urls(destination):
    _, dest_city = get_location_codes(destination)
    return [
        {"provider": "Thomas Cook", "url": f"https://www.thomascook.in/holidays/india-tour-packages/{dest_city}-tour-packages"},
        {"provider": "Thrillophilia Packages", "url": f"https://www.thrillophilia.com/destinations/{dest_city}/tours"}
    ]


# ==========================================
# 4. IMPLEMENTED CELERY CLUSTER TASKS
# ==========================================
RETRY_KWARGS = {
    "autoretry_for": (APIError,),
    "retry_backoff": True,       
    "retry_backoff_max": 45,     
    "retry_jitter": True,        
    "max_retries": 5             
}

@celery_app.task(bind=True, **RETRY_KWARGS)
def scrape_flights_task(self, origin: str, destination: str, date: str):
    self.update_state(state='PROGRESS', meta={'status': 'Deploying parallel scrapers across Flight OTAs...'})
    urls = get_flight_urls(origin, destination, date)
    context = f"Flights from {origin} to {destination} on {date}"
    return parse_html_to_json(fetch_all_html(urls), ExtractedDealsResult, search_context=context)

@celery_app.task(bind=True, **RETRY_KWARGS)
def scrape_hotels_task(self, city: str, checkin: str, checkout: str, guests: int):
    self.update_state(state='PROGRESS', meta={'status': 'Deploying parallel scrapers across Hotel Aggregators...'})
    urls = get_hotel_urls(city, checkin, checkout, guests)
    context = f"Hotels in {city} from {checkin} to {checkout} for {guests} guests"
    return parse_html_to_json(fetch_all_html(urls), ExtractedDealsResult, search_context=context)

@celery_app.task(bind=True, **RETRY_KWARGS)
def scrape_trains_task(self, origin: str, destination: str, date: str):
    self.update_state(state='PROGRESS', meta={'status': 'Checking live IRCTC and aggregator train availability...'})
    urls = get_train_urls(origin, destination, date)
    context = f"Trains from {origin} to {destination} on {date}"
    return parse_html_to_json(fetch_all_html(urls), ExtractedDealsResult, search_context=context)

@celery_app.task(bind=True, **RETRY_KWARGS)
def scrape_buses_task(self, origin: str, destination: str, date: str):
    self.update_state(state='PROGRESS', meta={'status': 'Scanning Volvo and Sleeper bus inventories...'})
    urls = get_bus_urls(origin, destination, date)
    context = f"Buses from {origin} to {destination} on {date}"
    return parse_html_to_json(fetch_all_html(urls), ExtractedDealsResult, search_context=context)

@celery_app.task(bind=True, **RETRY_KWARGS)
def scrape_cabs_task(self, origin: str, destination: str, date: str):
    self.update_state(state='PROGRESS', meta={'status': 'Checking outstation cab rates...'})
    urls = get_cab_urls(origin, destination, date)
    context = f"Cabs from {origin} to {destination} on {date}"
    return parse_html_to_json(fetch_all_html(urls), ExtractedDealsResult, search_context=context)

@celery_app.task(bind=True, **RETRY_KWARGS)
def scrape_tours_task(self, destination: str, date: str, guests: int):
    """Isolated Pre-Made Holiday package search. No custom DIY constraints are mixed here."""
    self.update_state(state='PROGRESS', meta={'status': f'Scanning all major travel operators for {destination} holiday deals...'})
    urls = get_tour_urls(destination)
    
    context = (
        f"PRE-MADE TOUR PACKAGES: Destination focused holiday deals for {destination} around {date} for {guests} travelers. "
        f"MISSION: Scrape complete packages listed by operators. If the raw text contains structured accordion timelines "
        f"(e.g., 'Day 1: Arrival', 'Day 2: Exploration'), extract those days explicitly into the 'itinerary' array."
    )
    return parse_html_to_json(fetch_all_html(urls), ExtractedDealsResult, search_context=context)

@celery_app.task(bind=True, **RETRY_KWARGS)
def scrape_diy_package_task(self, origin: str, destination: str, date: str, duration: int, guests: int, budget: str):
    """
    Unified cluster workflow extracting flights, hotels, and local ground transport matrices.
    Forces the generative assembly parser to synthesize multiple package options locked entirely to one tier.
    """
    self.update_state(state='PROGRESS', meta={'status': 'Simultaneously scraping Flights, Hotels, and Ground Transport...'})
    
    start_date_obj = datetime.strptime(date, "%Y-%m-%d")
    checkout_date = (start_date_obj + timedelta(days=int(duration))).strftime("%Y-%m-%d")
    
    flight_urls = get_flight_urls(origin, destination, date)
    hotel_urls = get_hotel_urls(destination, date, checkout_date, guests)
    cab_urls = get_cab_urls(origin, destination, date)
    
    all_urls = flight_urls + hotel_urls + cab_urls
    combined_html = fetch_all_html(all_urls)
    
    context = (
        f"DIY TRIP ASSEMBLY: From {origin} to {destination}. "
        f"Timeline Window: {date} to {checkout_date} ({duration} days total). "
        f"Total Travelers: {guests} person(s). "
        f"BUDGET TIER REQUESTED: {budget.upper()}. "
        f"MISSION: You must generate 3 distinct 'Assembled Package Options' (e.g., Option 1, Option 2, Option 3) "
        f"that ALL strictly fall into the requested {budget.upper()} category. Do not return luxury or moderate items if "
        f"the user requested shoestring. Lock the tier, give multiple choices within it, and write a custom day-by-day itinerary."
    )
    
    return parse_html_to_json(combined_html, ExtractedDealsResult, search_context=context)