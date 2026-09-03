import os
import sys
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
root_dir = os.path.dirname(backend_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Load environment variables from .env if exists
env_path = os.path.join(root_dir, ".env")
if os.path.exists(env_path):
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())
    except Exception as e:
        print(f"[WARN] Error reading .env: {e}")

from app.api.trains import router as trains_router
from app.api.network import router as network_router
from app.api.train_registry import train_registry

# Background live fleet simulation ticker
async def live_simulation_ticker():
    """
    [PRIORITY 1: MULTI-TRAIN FLEET SIMULATION TICKER]
    Simulates realistic independent train movements across ALL active fleet trains every 15 seconds:
    - Independent route progress and speed fluctuations per train
    - Dynamic re-computation of XGBoost & Random Forest ETA predictions
    """
    while True:
        await asyncio.sleep(15)
        try:
            train_registry.update_fleet_simulation_step()
        except Exception as e:
            print(f"[WARN] Fleet simulation ticker error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start background multi-train ticker
    ticker_task = asyncio.create_task(live_simulation_ticker())
    print(f"[OK] Started RailVue AI Fleet Simulation Ticker ({len(train_registry.active_trains)} Active Trains)")
    yield
    print("[INFO] Shutting down background tasks...")
    ticker_task.cancel()

app = FastAPI(
    title="RailVue AI API",
    description="Real-Time Dynamic ETA Prediction System for Indian Railways (Smart India Hackathon)",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trains_router)
app.include_router(network_router)

@app.get("/")
async def root():
    return {
        "system": "RailVue AI - Real-Time Dynamic ETA Prediction System",
        "event": "Smart India Hackathon Solution",
        "status": "Operational",
        "active_train_fleet_count": len(train_registry.active_trains),
        "ml_models": [
            "XGBoost Regressor (eta_xgboost.json)",
            "Random Forest Regressor (eta_random_forest.pkl)",
            "Schedule Baseline Formula"
        ],
        "endpoints": [
            "GET /api/trains (All Active Trains)",
            "POST /api/trains/batch-eta (Batch ML ETA Predictions)",
            "GET /api/dataset/metadata (Dataset Lineage & Metadata)",
            "GET /api/trains/{train_id}/live",
            "GET /api/trains/{train_id}/eta",
            "GET /api/trains/{train_id}/eta/explanation",
            "GET /api/network/congestion",
            "GET /api/alerts",
            "POST /api/simulation/event"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
