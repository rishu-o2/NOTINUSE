"""
main_api.py — Lightweight FastAPI backend for City-Wide AI Traffic Surveillance.

Reads all data from CSV files via api_data.py (no database required).
Run:  uvicorn main_api:app --reload --port 8000
"""

from __future__ import annotations

import asyncio
import json
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

import api_data

logger = logging.getLogger("TrafficAPI")

# ─── WebSocket connection manager ─────────────────────────────────────────────

class ConnectionManager:
    """Manages active WebSocket connections for the live feed."""

    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self.active.append(ws)
        logger.info("WS client connected  (%d active)", len(self.active))

    def disconnect(self, ws: WebSocket) -> None:
        if ws in self.active:
            self.active.remove(ws)
            logger.info("WS client disconnected (%d active)", len(self.active))

    async def broadcast(self, payload: dict) -> None:
        text = json.dumps(payload)
        dead = []
        for ws in self.active:
            try:
                await ws.send_text(text)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


ws_manager = ConnectionManager()

# ─── Background live-feed broadcaster ─────────────────────────────────────────

async def _live_feed_loop():
    """Push a plate read every 2 s; every 10th message is an alert."""
    idx = 0
    while True:
        await asyncio.sleep(2)
        if not ws_manager.active:
            continue
        idx += 1
        if idx % 10 == 0:
            event = api_data.ws_alert_event()
        else:
            event = api_data.ws_plate_event(idx)
        await ws_manager.broadcast(event)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(_live_feed_loop())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="City-Wide AI Traffic Surveillance API",
    description="CSV-backed REST + WebSocket backend for the React dashboard",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── REST endpoints ──────────────────────────────────────────────────────────

@app.get("/api/stats")
def stats():
    """Top-level command-center statistics."""
    return api_data.get_stats()


@app.get("/api/plate-reads")
def plate_reads(
    limit: int = Query(50, ge=1, le=500),
    camera_id: Optional[str] = None,
    status: Optional[str] = None,
):
    """Latest ANPR plate reads from the CSV data."""
    records = api_data.get_plate_reads(limit=limit)

    if camera_id and camera_id != "ALL":
        records = [r for r in records if r["camera_id"] == camera_id]

    if status and status != "ALL":
        if status == "Blacklist":
            records = [r for r in records if r["is_blacklisted"]]
        elif status == "Speeding":
            records = [r for r in records if r.get("speed_kmh", 0) >= 75]
        elif status == "Clear":
            records = [r for r in records if not r["is_blacklisted"]]

    return records[:limit]


@app.get("/api/trajectory")
def trajectory(plate: str = Query(..., description="Vehicle plate to track")):
    """Reconstruct multi-camera path for a vehicle."""
    return api_data.get_trajectory(plate)


@app.get("/api/cameras")
def cameras():
    """All 8 surveillance camera nodes with status."""
    return api_data.get_cameras()


@app.get("/api/alerts")
def alerts():
    """Active security and traffic alerts."""
    return api_data.get_alerts()


@app.get("/api/analytics/hourly")
def analytics_hourly():
    """24-hour vehicle count distribution."""
    return api_data.get_hourly_counts()


@app.get("/api/analytics/congestion")
def analytics_congestion():
    """Congestion percentage per road segment."""
    return api_data.get_congestion()


@app.get("/api/analytics/heatmap")
def analytics_heatmap():
    """Heatmap intensity per camera location."""
    return api_data.get_heatmap()


# ─── WebSocket live feed ─────────────────────────────────────────────────────

@app.websocket("/ws/live")
async def ws_live(websocket: WebSocket):
    """
    Real-time feed.  The background loop broadcasts every 2 s;
    this handler just keeps the connection alive and responds to pings.
    """
    await ws_manager.connect(websocket)
    try:
        await websocket.send_json({
            "type": "connection",
            "message": "Connected to City Traffic Command WebSocket Hub",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)


# ─── Entry point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main_api:app", host="0.0.0.0", port=8000, reload=True)
