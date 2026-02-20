"""
Pydantic schemas for SmartBee API request/response models.

HACKATHON: Models match mock data structure.
PRODUCTION: Extend with database ORM models (SQLAlchemy), add validation,
            and connect to TfGM real-time data feeds.
"""

from pydantic import BaseModel
from typing import Optional, List


# ─── Arrivals ────────────────────────────────────────────────────────────────

class ArrivalItem(BaseModel):
    route: str
    destination: str
    due_minutes: int
    status: str  # "ontime" | "late" | "cancelled"
    delay_minutes: Optional[int] = None
    stop_name: str
    platform: Optional[str] = None


class ArrivalsResponse(BaseModel):
    stop: str
    last_updated: str
    arrivals: List[ArrivalItem]


# ─── Routes ──────────────────────────────────────────────────────────────────

class RouteOption(BaseModel):
    type: str          # "fastest" | "cheapest" | "orbital"
    label: str
    duration_minutes: int
    cost_gbp: float
    changes: int
    legs: List[str]   # e.g. ["Bus 42 from Piccadilly", "Walk 3 min to Chorlton St"]
    co2_grams: int
    summary: str


class RoutesResponse(BaseModel):
    origin: str
    destination: str
    departure_time: str
    options: List[RouteOption]


# ─── Heatmap ─────────────────────────────────────────────────────────────────

class HeatmapPoint(BaseModel):
    lat: float
    lng: float
    intensity: float   # 0.0 – 1.0
    label: Optional[str] = None


class HeatmapResponse(BaseModel):
    timestamp: str
    metric: str        # "demand" | "delay" | "crowding"
    points: List[HeatmapPoint]


# ─── Road Closure ─────────────────────────────────────────────────────────────

class RoadClosureRequest(BaseModel):
    road_id: str       # e.g. "oxford_road"
    duration_hours: int = 4


class AffectedRoute(BaseModel):
    route: str
    impact: str        # "diverted" | "suspended" | "delayed"
    extra_minutes: int
    alternative: Optional[str] = None


class ClosureImpactResponse(BaseModel):
    road_id: str
    road_name: str
    affected_routes: List[AffectedRoute]
    estimated_passengers_affected: int
    recommended_action: str
