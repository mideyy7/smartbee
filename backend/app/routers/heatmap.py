"""
Heatmap Router — /api/heatmap

HACKATHON: Returns mocked demand/delay heatmap point cloud for Manchester.
PRODUCTION: Aggregate from:
  - TfGM SIRI vehicle positions (delay intensity)
  - Smart ticketing tap-on/tap-off data (demand intensity)
  - Historical ridership patterns (predictive layer)
  Serve via PostGIS spatial queries, cache with Redis.
"""

from fastapi import APIRouter, Query
from datetime import datetime

from app.models.schemas import HeatmapResponse, HeatmapPoint

router = APIRouter(prefix="/heatmap", tags=["heatmap"])

# HACKATHON MOCK: Manually crafted heatmap points centred on Manchester.
# PRODUCTION: Replace with real-time aggregation from SIRI vehicle feed
#             + smart ticketing tap data from Bee Network validators.
DEMAND_POINTS = [
    # Piccadilly area — very high demand
    HeatmapPoint(lat=53.4779, lng=-2.2323, intensity=0.95, label="Piccadilly Gardens"),
    HeatmapPoint(lat=53.4790, lng=-2.2310, intensity=0.85),
    HeatmapPoint(lat=53.4770, lng=-2.2340, intensity=0.80),
    # Deansgate
    HeatmapPoint(lat=53.4786, lng=-2.2491, intensity=0.72, label="Deansgate"),
    HeatmapPoint(lat=53.4775, lng=-2.2510, intensity=0.60),
    # Oxford Road corridor
    HeatmapPoint(lat=53.4710, lng=-2.2370, intensity=0.88, label="Oxford Road"),
    HeatmapPoint(lat=53.4670, lng=-2.2340, intensity=0.82),
    HeatmapPoint(lat=53.4640, lng=-2.2310, intensity=0.75),
    # Fallowfield — student peak
    HeatmapPoint(lat=53.4424, lng=-2.2175, intensity=0.91, label="Fallowfield"),
    HeatmapPoint(lat=53.4410, lng=-2.2180, intensity=0.78),
    # Chorlton
    HeatmapPoint(lat=53.4450, lng=-2.2753, intensity=0.55, label="Chorlton"),
    # Salford Quays
    HeatmapPoint(lat=53.4715, lng=-2.2992, intensity=0.65, label="Salford Quays"),
    HeatmapPoint(lat=53.4730, lng=-2.3010, intensity=0.50),
    # Northern Quarter
    HeatmapPoint(lat=53.4840, lng=-2.2338, intensity=0.70, label="Northern Quarter"),
    # Ancoats
    HeatmapPoint(lat=53.4815, lng=-2.2221, intensity=0.60, label="Ancoats"),
    # Airport — low demand, high delay
    HeatmapPoint(lat=53.3658, lng=-2.2723, intensity=0.40, label="Airport"),
]

DELAY_POINTS = [
    HeatmapPoint(lat=53.4779, lng=-2.2323, intensity=0.90, label="Piccadilly: avg +9 min"),
    HeatmapPoint(lat=53.4710, lng=-2.2370, intensity=0.95, label="Oxford Rd: avg +12 min"),
    HeatmapPoint(lat=53.4424, lng=-2.2175, intensity=0.85, label="Fallowfield: avg +15 min"),
    HeatmapPoint(lat=53.4786, lng=-2.2491, intensity=0.65, label="Deansgate: avg +7 min"),
    HeatmapPoint(lat=53.3658, lng=-2.2723, intensity=0.75, label="Airport: avg +20 min"),
    HeatmapPoint(lat=53.4715, lng=-2.2992, intensity=0.30, label="Salford Quays: avg +3 min"),
]


@router.get("", response_model=HeatmapResponse)
async def get_heatmap(
    metric: str = Query(default="demand", description="Metric type: 'demand' | 'delay' | 'crowding'"),
):
    """
    Get heatmap intensity points for Manchester network visualisation.

    HACKATHON: Returns static mock point cloud.
    PRODUCTION: Query PostGIS for last-15-min aggregated stop events.
                Support metric=demand (tap-on counts), metric=delay (SIRI variance),
                metric=crowding (vehicle load factor from APC sensors).
    """
    points = DELAY_POINTS if metric == "delay" else DEMAND_POINTS

    return HeatmapResponse(
        timestamp=datetime.now().isoformat(),
        metric=metric,
        points=points,
    )
