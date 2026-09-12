# City-Wide AI Traffic Command Center — Backend API

FastAPI backend connecting the AI pipeline (YOLOv8, ByteTrack, EasyOCR) to the React frontend dashboard.

## Architecture

```
Camera Feed / Video Stream
        ↓
yolov8.py         — Vehicle Detection (car, bus, bike, truck)
bytetrack.py      — Multi-Object Tracking (unique Track IDs)
veichle_crop.py   — Crop individual vehicles from frames
anpr_ocr.py       — License Plate Reading (EasyOCR)
        ↓
POST /api/plate-read   ← AI pipeline calls this endpoint per detection
        ↓
database.py       — Saves: plate, camera, GPS, timestamp, speed
alerts.py         — Blacklist check + velocity anomaly detection
websocket.py      — Broadcasts live event to frontend over WS
        ↓
React Dashboard   ← Calls REST API + listens on ws://localhost:8000/ws/live
```

## Backend Files

| File | Purpose |
|---|---|
| `main.py` | FastAPI app — all endpoints and WebSocket |
| `database.py` | SQLAlchemy async models + seeded data |
| `config.py` | All settings (cameras, blacklist, thresholds) |
| `trajectory.py` | Multi-camera path reconstruction (haversine) |
| `analytics.py` | Hourly counts, congestion, OD matrix, heatmap |
| `alerts.py` | Blacklist lookup, anomaly detection, alert creation |
| `websocket.py` | WebSocket ConnectionManager (broadcast to clients) |

## Setup

```bash
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Run the API server
python main.py
# or
uvicorn main:app --reload --port 8000
```

Server runs at: `http://localhost:8000`

Interactive API docs: `http://localhost:8000/docs`

## Database

By default, uses **SQLite** (zero config) stored at `./traffic_command.db`.

To switch to PostgreSQL, set the environment variable:
```bash
set DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/traffic_db
```

On first startup, the database is auto-created and seeded with:
- 8 Delhi camera nodes
- 10 demo vehicle trajectory reads
- 3 sample active alerts

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stats` | System overview stats |
| GET | `/api/cameras` | All 8 camera nodes |
| GET | `/api/plate-reads?limit=50` | Latest ANPR reads |
| GET | `/api/trajectory?plate=PB10XX1234` | Vehicle route history |
| GET | `/api/analytics/hourly` | 24-hour traffic volume |
| GET | `/api/analytics/congestion` | Road congestion % |
| GET | `/api/analytics/heatmap` | GPS intensity heatmap |
| GET | `/api/alerts` | Active unresolved alerts |
| POST | `/api/alerts/{id}/resolve` | Resolve an alert |
| POST | `/api/plate-read` | Ingest new ANPR detection from AI pipeline |
| WS | `/ws/live` | Real-time event stream |

## WebSocket Events

Connect: `ws://localhost:8000/ws/live`

Events pushed to frontend:
```json
{ "event": "CONNECTION_ESTABLISHED", ... }
{ "event": "NEW_PLATE_READ", "data": { "plate": "...", "camera_id": "...", ... } }
{ "event": "ALERT_RESOLVED", "alert_id": 3, ... }
```

## AI Pipeline Integration

To push a new plate detection from your AI pipeline:
```python
import requests

requests.post("http://localhost:8000/api/plate-read", json={
    "plate_text": "PB10XX1234",
    "camera_id": "CAM-01",
    "vehicle_type": "Sedan (White)",
    "confidence": 0.97,
    "speed_kmh": 42.0,
    "image_path": "/crops/PB10XX1234_CAM01.jpg"
})
```

## Bharat Electronics Limited · SIH 2026
