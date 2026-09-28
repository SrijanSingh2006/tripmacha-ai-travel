from fastapi import APIRouter, Query
from typing import Optional
from app.workers.tasks import (
    scrape_flights_task, 
    scrape_hotels_task, 
    scrape_trains_task, 
    scrape_buses_task, 
    scrape_cabs_task,
    scrape_tours_task,
    scrape_diy_package_task  # Unified multi-worker package assembly task
)
from celery.result import AsyncResult

router = APIRouter()

@router.post("/trigger-search")
async def trigger_search(
    mode: str,
    origin: Optional[str] = None,
    destination: Optional[str] = None,
    date: Optional[str] = None,
    city: Optional[str] = None,
    checkin: Optional[str] = None,
    checkout: Optional[str] = None,
    guests: Optional[int] = 1,
    duration: Optional[int] = Query(3, description="Duration of the trip in days for custom DIY packaging"),
    budget: Optional[str] = Query("moderate", description="User budget restriction tier (shoestring, moderate, premium, luxury)")
):
    """
    Central API Router balancing ingress queries across specific execution clusters.
    Maps parameters to independent async workers via Redis serialization.
    Now optimized to route and support dynamic DIY cross-platform matrix aggregation.
    """
    if mode == 'diy':
        # Hand off parameters to the composite bundle matrix manager
        task = scrape_diy_package_task.delay(
            origin=origin,
            destination=destination,
            date=date,
            duration=duration,
            guests=guests,
            budget=budget
        )
        
    elif mode == 'flights':
        task = scrape_flights_task.delay(origin, destination, date)
        
    elif mode == 'hotels':
        task = scrape_hotels_task.delay(city, checkin, checkout, guests)
        
    elif mode == 'trains':
        task = scrape_trains_task.delay(origin, destination, date)
        
    elif mode == 'buses':
        task = scrape_buses_task.delay(origin, destination, date)
        
    elif mode == 'cabs':
        task = scrape_cabs_task.delay(origin, destination, date)
        
    elif mode == 'tours':
        # Route logic targeting bundled holiday metadata matrices
        task = scrape_tours_task.delay(destination, date, guests)
        
    else:
        return {"error": "Invalid search execution parameter"}
        
    return {"task_id": task.id, "status": f"Processing {mode} matrix execution"}

@router.post("/trigger-flight-search")
async def trigger_flight_search(
    destination: str,
    date: str,
    origin: Optional[str] = "DEL"
):
    """Convenience endpoint called by AI Chat Co-Pilot to trigger flight scrapers."""
    task = scrape_flights_task.delay(origin, destination, date)
    return {"task_id": task.id, "status": "Processing flights matrix execution"}

@router.get("/status/{task_id}")
async def get_task_status(task_id: str):
    """Standard health loop evaluating async computation progress frames."""
    task = AsyncResult(task_id)
    
    if task.state in ['PENDING', 'STARTED', 'PROGRESS']:
        # Attempt to gather contextual state frames from the worker if publishing updates
        meta = getattr(task, 'info', None) or {}
        status_msg = meta.get('status', 'running') if isinstance(meta, dict) else "running"
        return {"status": status_msg, "data": None}
        
    elif task.state == 'SUCCESS':
        return {"status": "completed", "data": task.result}
        
    else:
        return {"status": "failed", "error": str(task.info)}