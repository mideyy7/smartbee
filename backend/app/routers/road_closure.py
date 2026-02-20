"""
Road Closure Impact Router — /api/road-closure-impact

HACKATHON: Returns mocked impact analysis for simulated road closures.
PRODUCTION: Run graph-based route impact analysis using NetworkX on GTFS road graph.
            Integrate with TfGM Traffic Management feed and Highways England API.
            Propagate delay cascades through affected routes in real time.
"""

from fastapi import APIRouter
from app.models.schemas import RoadClosureRequest, ClosureImpactResponse, AffectedRoute

router = APIRouter(prefix="/road-closure-impact", tags=["road-closure"])

# HACKATHON MOCK: Pre-computed impact scenarios for key Manchester roads.
# PRODUCTION: Run GTFS graph traversal, identify all services crossing the road,
#             calculate diversion distances, compute passenger impact via smart ticketing data.
CLOSURE_SCENARIOS = {
    "oxford_road": ClosureImpactResponse(
        road_id="oxford_road",
        road_name="Oxford Road (A34)",
        affected_routes=[
            AffectedRoute(route="42", impact="diverted", extra_minutes=12, alternative="Via Wilmslow Road"),
            AffectedRoute(route="142", impact="diverted", extra_minutes=10, alternative="Via Wilmslow Road"),
            AffectedRoute(route="111", impact="delayed", extra_minutes=18, alternative=None),
            AffectedRoute(route="X57", impact="suspended", extra_minutes=0, alternative="Use Metrolink to Airport"),
        ],
        estimated_passengers_affected=14_200,
        recommended_action="Deploy additional vehicles on Wilmslow Road corridor. Alert passengers via Bee Network app.",
    ),
    "princess_street": ClosureImpactResponse(
        road_id="princess_street",
        road_name="Princess Street (A57)",
        affected_routes=[
            AffectedRoute(route="15", impact="diverted", extra_minutes=8, alternative="Via Great Bridgewater St"),
            AffectedRoute(route="86", impact="delayed", extra_minutes=6, alternative=None),
            AffectedRoute(route="50", impact="diverted", extra_minutes=10, alternative="Via Deansgate"),
        ],
        estimated_passengers_affected=6_800,
        recommended_action="Temporary bus gate on Great Bridgewater St. Coordinate with GMP for traffic management.",
    ),
    "deansgate": ClosureImpactResponse(
        road_id="deansgate",
        road_name="Deansgate (A56)",
        affected_routes=[
            AffectedRoute(route="33", impact="diverted", extra_minutes=14, alternative="Via Chester Road"),
            AffectedRoute(route="V1", impact="suspended", extra_minutes=0, alternative="Walking route to St Peter's Sq"),
            AffectedRoute(route="36", impact="delayed", extra_minutes=9, alternative=None),
        ],
        estimated_passengers_affected=9_400,
        recommended_action="Activate contingency timetable C7. Increase Metrolink frequency on Altrincham line.",
    ),
    "wilmslow_road": ClosureImpactResponse(
        road_id="wilmslow_road",
        road_name="Wilmslow Road (A34)",
        affected_routes=[
            AffectedRoute(route="42", impact="diverted", extra_minutes=20, alternative="Via Princess Parkway"),
            AffectedRoute(route="43", impact="diverted", extra_minutes=15, alternative="Via Princess Parkway"),
            AffectedRoute(route="142", impact="suspended", extra_minutes=0, alternative="Use route 42 diversion"),
        ],
        estimated_passengers_affected=18_600,
        recommended_action="CRITICAL: Wilmslow Road serves 18,000+ daily passengers. Immediate diversion plan required.",
    ),
}

DEFAULT_IMPACT = ClosureImpactResponse(
    road_id="unknown",
    road_name="Selected Road",
    affected_routes=[
        AffectedRoute(route="Various", impact="delayed", extra_minutes=10, alternative=None),
    ],
    estimated_passengers_affected=2_000,
    recommended_action="Monitor situation. Apply standard diversion protocol.",
)


@router.post("", response_model=ClosureImpactResponse)
async def simulate_road_closure(body: RoadClosureRequest):
    """
    Simulate the impact of closing a road on Manchester bus network.

    HACKATHON: Returns a pre-computed mock impact scenario.
    PRODUCTION:
      1. Lookup all GTFS route shapes intersecting the road geometry (PostGIS ST_Intersects)
      2. For each affected service, compute diversion distance using road graph (OSMnx/NetworkX)
      3. Estimate delay as: diversion_distance / average_speed + dwell_time_penalty
      4. Estimate passengers: multiply service_frequency × avg_occupancy × hours_affected
      5. Rank alternatives by capacity headroom (from real-time vehicle load data)
    """
    impact = CLOSURE_SCENARIOS.get(body.road_id, DEFAULT_IMPACT)
    return impact
