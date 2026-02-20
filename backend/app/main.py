"""
SmartBee FastAPI Application — Manchester Intelligent Transport

HACKATHON: All endpoints return mock data with realistic structure.
PRODUCTION: Replace mock data with live TfGM feeds, PostgreSQL/PostGIS,
            Redis caching, and ML model inference endpoints.

Run: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
Docs: http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import arrivals, routes, heatmap, road_closure

app = FastAPI(
    title="SmartBee API",
    description="🐝 Intelligent Transport for Manchester — Hackathon MVP",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
# HACKATHON: Allow all origins for easy demo.
# PRODUCTION: Restrict to your frontend domain + internal services.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(arrivals.router, prefix="/api")
app.include_router(routes.router, prefix="/api")
app.include_router(heatmap.router, prefix="/api")
app.include_router(road_closure.router, prefix="/api")


# ─── Health check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["health"])
async def root():
    return {
        "service": "SmartBee API",
        "status": "operational",
        "version": "0.1.0",
        "network": "Greater Manchester",
        "endpoints": [
            "GET  /api/arrivals?stop=piccadilly",
            "GET  /api/routes?origin=piccadilly&destination=chorlton",
            "GET  /api/heatmap?metric=demand",
            "POST /api/road-closure-impact",
        ],
    }


@app.get("/health", tags=["health"])
async def health():
    # PRODUCTION: Add database ping, Redis ping, TfGM feed connectivity check
    return {"status": "healthy", "mock_mode": True}
