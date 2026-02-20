"""
Arrivals Router — /api/arrivals

HACKATHON: Returns mocked bus arrival data for Manchester stops.
PRODUCTION: Connect to TfGM real-time SIRI feed or Traveline National Dataset (TNDS).
            Use websockets or SSE for push updates every 30s.
"""

from fastapi import APIRouter, Query
from datetime import datetime

from app.models.schemas import ArrivalsResponse, ArrivalItem

router = APIRouter(prefix="/arrivals", tags=["arrivals"])

# HACKATHON MOCK: Static arrival data keyed by stop name.
# PRODUCTION: Replace with live TfGM GTFS-RT feed parser.
MOCK_ARRIVALS = {
    "piccadilly": [
        ArrivalItem(route="43", destination="Chorlton", due_minutes=2, status="late", delay_minutes=5, stop_name="Piccadilly Gardens", platform="A"),
        ArrivalItem(route="111", destination="Manchester Airport", due_minutes=4, status="ontime", stop_name="Piccadilly Gardens", platform="B"),
        ArrivalItem(route="42", destination="Fallowfield", due_minutes=7, status="late", delay_minutes=3, stop_name="Piccadilly Gardens", platform="A"),
        ArrivalItem(route="8", destination="Harpurhey", due_minutes=11, status="ontime", stop_name="Piccadilly Gardens", platform="C"),
        ArrivalItem(route="216", destination="Stockport", due_minutes=14, status="late", delay_minutes=8, stop_name="Piccadilly Gardens", platform="D"),
    ],
    "deansgate": [
        ArrivalItem(route="15", destination="Salford Quays", due_minutes=3, status="ontime", stop_name="Deansgate", platform="A"),
        ArrivalItem(route="86", destination="Chorlton via Whalley Range", due_minutes=9, status="late", delay_minutes=8, stop_name="Deansgate", platform="A"),
        ArrivalItem(route="50", destination="Eccles", due_minutes=12, status="ontime", stop_name="Deansgate", platform="B"),
    ],
    "chorlton": [
        ArrivalItem(route="85", destination="City Centre", due_minutes=1, status="ontime", stop_name="Chorlton", platform="A"),
        ArrivalItem(route="86", destination="Deansgate", due_minutes=5, status="late", delay_minutes=5, stop_name="Chorlton", platform="A"),
        ArrivalItem(route="23", destination="Fallowfield", due_minutes=8, status="ontime", stop_name="Chorlton", platform="B"),
    ],
    "fallowfield": [
        ArrivalItem(route="42", destination="Piccadilly", due_minutes=6, status="late", delay_minutes=15, stop_name="Fallowfield", platform="A"),
        ArrivalItem(route="142", destination="East Didsbury", due_minutes=9, status="ontime", stop_name="Fallowfield", platform="B"),
        ArrivalItem(route="43", destination="Chorlton", due_minutes=13, status="ontime", stop_name="Fallowfield", platform="A"),
    ],
    "salford_quays": [
        ArrivalItem(route="50", destination="Piccadilly", due_minutes=4, status="ontime", stop_name="Salford Quays", platform="A"),
        ArrivalItem(route="M50", destination="Media City", due_minutes=7, status="delayed", delay_minutes=3, stop_name="Salford Quays", platform="B"),
    ],
    "airport": [
        ArrivalItem(route="43", destination="Piccadilly", due_minutes=8, status="late", delay_minutes=20, stop_name="Manchester Airport", platform="T1"),
        ArrivalItem(route="199", destination="Wythenshawe", due_minutes=3, status="ontime", stop_name="Manchester Airport", platform="T2"),
    ],
}


@router.get("", response_model=ArrivalsResponse)
async def get_arrivals(
    stop: str = Query(default="piccadilly", description="Stop name (e.g. piccadilly, deansgate, chorlton)"),
):
    """
    Get live arrival predictions for a Manchester bus stop.

    HACKATHON: Returns pre-seeded mock data.
    PRODUCTION: Query TfGM SIRI-SM endpoint, parse XML, cache with Redis (TTL 30s).
    """
    stop_key = stop.lower().replace(" ", "_")
    arrivals = MOCK_ARRIVALS.get(stop_key, MOCK_ARRIVALS["piccadilly"])

    return ArrivalsResponse(
        stop=stop.title(),
        last_updated=datetime.now().strftime("%H:%M:%S"),
        arrivals=arrivals,
    )
