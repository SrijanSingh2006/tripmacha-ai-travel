from pydantic import BaseModel
from typing import List, Optional

class FlightDetails(BaseModel):
    airline: str
    price: int
    departure_time: str
    arrival_time: str
    duration: str
    source_url: str

class ExtractedFlightsResult(BaseModel):
    destination: str
    flights: List[FlightDetails]