from pydantic import BaseModel
from typing import List

class TourPackage(BaseModel):
    provider: str
    title: str
    destination: str
    duration: int
    price: int
    inclusions: List[str]
    bookingUrl: str

class ExtractedToursResult(BaseModel):
    packages: List[TourPackage]