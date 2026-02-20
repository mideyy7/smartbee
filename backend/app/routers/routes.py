"""
Routes Router — /api/routes

HACKATHON: Returns mocked journey options between Manchester locations.
PRODUCTION: Integrate with OpenTripPlanner (OTP) running on GTFS data from TfGM,
            or Traveline Journey Planner API. Add real-time delay adjustments via SIRI.
"""

from fastapi import APIRouter, Query
from datetime import datetime

from app.models.schemas import RoutesResponse, RouteOption

router = APIRouter(prefix="/routes", tags=["routes"])

# HACKATHON MOCK: Hand-crafted route options for the key demo journey.
# PRODUCTION: Call OTP REST API: GET /otp/routers/default/plan?fromPlace=...&toPlace=...
MOCK_ROUTES = {
    ("piccadilly", "chorlton"): [
        RouteOption(
            type="fastest",
            label="⚡ Fastest",
            duration_minutes=22,
            cost_gbp=2.50,
            changes=0,
            legs=["Bus 86 from Piccadilly Gardens (Plat A)", "Direct to Chorlton, Barlow Moor Road"],
            co2_grams=180,
            summary="Direct bus, no changes needed.",
        ),
        RouteOption(
            type="cheapest",
            label="💸 Cheapest",
            duration_minutes=35,
            cost_gbp=2.00,
            changes=1,
            legs=["Bus 42 from Piccadilly to Fallowfield", "Walk 5 min", "Bus 23 to Chorlton Centre"],
            co2_grams=220,
            summary="Slightly longer but saves £0.50.",
        ),
        RouteOption(
            type="orbital",
            label="🛤️ Orbital (avoids city centre)",
            duration_minutes=28,
            cost_gbp=2.50,
            changes=0,
            legs=["NEW: Orbital Route O1 from Deansgate (200m walk)", "Direct to Chorlton via Whalley Range"],
            co2_grams=160,
            summary="SmartBee orbital route — skips Piccadilly congestion.",
        ),
    ],
    ("piccadilly", "fallowfield"): [
        RouteOption(
            type="fastest",
            label="⚡ Fastest",
            duration_minutes=18,
            cost_gbp=2.50,
            changes=0,
            legs=["Bus 42 from Piccadilly Gardens (Plat A)", "Direct to Fallowfield Oxford Road"],
            co2_grams=140,
            summary="Direct service, 18 minutes door-to-door.",
        ),
        RouteOption(
            type="cheapest",
            label="💸 Cheapest",
            duration_minutes=26,
            cost_gbp=2.00,
            changes=1,
            legs=["Metrolink Tram to St Peter's Square", "Bus 142 to Fallowfield"],
            co2_grams=100,
            summary="Part tram — lower carbon and cost.",
        ),
        RouteOption(
            type="orbital",
            label="🛤️ Orbital",
            duration_minutes=24,
            cost_gbp=2.50,
            changes=0,
            legs=["NEW: Orbital Route O2 from Piccadilly", "Via Ancoats & Rusholme to Fallowfield"],
            co2_grams=130,
            summary="New route avoids Oxford Road bottleneck.",
        ),
    ],
}

# Default fallback for unknown pairs
DEFAULT_ROUTES = [
    RouteOption(
        type="fastest",
        label="⚡ Fastest",
        duration_minutes=30,
        cost_gbp=2.50,
        changes=1,
        legs=["Bus from origin stop", "Connect at Piccadilly", "Bus to destination"],
        co2_grams=200,
        summary="Standard journey via city centre.",
    ),
]


@router.get("", response_model=RoutesResponse)
async def get_routes(
    origin: str = Query(default="piccadilly", description="Origin stop"),
    destination: str = Query(default="chorlton", description="Destination stop"),
):
    """
    Plan a journey between two Manchester stops.

    HACKATHON: Returns 3 mock options (fastest, cheapest, orbital).
    PRODUCTION: POST to OTP with GTFS feed + live SIRI delay overlay.
                Apply SmartBee orbital scoring model (custom ML).
    """
    key = (origin.lower(), destination.lower())
    options = MOCK_ROUTES.get(key, DEFAULT_ROUTES)

    return RoutesResponse(
        origin=origin.title(),
        destination=destination.title(),
        departure_time=datetime.now().strftime("%H:%M"),
        options=options,
    )
