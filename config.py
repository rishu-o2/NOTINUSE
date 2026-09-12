import os
from typing import List, Dict, Any

# Database URL - defaults to SQLite async for zero-config local run, or PostgreSQL if provided
DATABASE_URL: str = os.getenv(
    "DATABASE_URL", 
    "sqlite+aiosqlite:///./traffic_command.db"
)

# 8 Core Surveillance Camera Nodes across Delhi NCR
DELHI_CAMERAS: List[Dict[str, Any]] = [
  {
      "id": "CAM-01",
      "name": "Connaught Place Outer Circle",
      "location": "Connaught Place Radial 1",
      "lat": 28.6328,
      "lng": 77.2197,
      "status": "ACTIVE"
  },
  {
      "id": "CAM-02",
      "name": "India Gate Radial Spine",
      "location": "Rajpath / C-Hexagon",
      "lat": 28.6129,
      "lng": 77.2295,
      "status": "ACTIVE"
  },
  {
      "id": "CAM-03",
      "name": "ITO Junction North Arterial",
      "location": "Vikas Marg Intersection",
      "lat": 28.6289,
      "lng": 77.2415,
      "status": "ACTIVE"
  },
  {
      "id": "CAM-04",
      "name": "Karol Bagh Pusa Road",
      "location": "Pusa Road Metro Cross",
      "lat": 28.6448,
      "lng": 77.1895,
      "status": "ACTIVE"
  },
  {
      "id": "CAM-05",
      "name": "AIIMS Ring Road Flyover",
      "location": "Sri Aurobindo Marg Intersect",
      "lat": 28.5672,
      "lng": 77.2100,
      "status": "ACTIVE"
  },
  {
      "id": "CAM-06",
      "name": "Dhaula Kuan Intersect",
      "location": "NH48 / Ring Road Flyover",
      "lat": 28.5921,
      "lng": 77.1563,
      "status": "ACTIVE"
  },
  {
      "id": "CAM-07",
      "name": "Lajpat Nagar Central Market",
      "location": "Feroze Gandhi Road",
      "lat": 28.5700,
      "lng": 77.2435,
      "status": "ACTIVE"
  },
  {
      "id": "CAM-08",
      "name": "Kashmiri Gate ISBT Junction",
      "location": "Lothian Road / Ring Rd",
      "lat": 28.6675,
      "lng": 77.2290,
      "status": "ACTIVE"
  }
]

# 10 Blacklisted & Hotlisted Surveillance Plates (NCR Police Hotlist)
BLACKLISTED_PLATES: List[str] = [
    "DL08CX9901",
    "HR26DQ5521",
    "UP16AZ4120",
    "DL01AB9999",
    "CH01TB9002",
    "RJ14CV6060",
    "DL04NB3119",
    "UP14BT8899",
    "HR55AC7788",
    "DL03XY9100"
]

# Detection Thresholds
CONFIDENCE_THRESHOLD: float = 0.80
ANOMALY_SPEED_THRESHOLD_KMH: float = 140.0
CORS_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000"
]
