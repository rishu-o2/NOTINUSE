"""
api_data.py — In-memory data layer for the Traffic Surveillance API.

Loads CSV files once on import. All helper functions return plain
Python dicts / lists so FastAPI can JSON-serialize them directly.
"""

from __future__ import annotations

import random
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

import pandas as pd

# ─── Camera registry ──────────────────────────────────────────────────────────
CAMERAS: dict[str, dict] = {
    "CAM-01": {"name": "Connaught Place",  "lat": 28.6315, "lng": 77.2167},
    "CAM-02": {"name": "India Gate",       "lat": 28.6129, "lng": 77.2295},
    "CAM-03": {"name": "ITO Junction",     "lat": 28.6262, "lng": 77.2410},
    "CAM-04": {"name": "Karol Bagh",       "lat": 28.6514, "lng": 77.1907},
    "CAM-05": {"name": "AIIMS Flyover",    "lat": 28.5672, "lng": 77.2100},
    "CAM-06": {"name": "Dhaula Kuan",      "lat": 28.5921, "lng": 77.1729},
    "CAM-07": {"name": "Lajpat Nagar",     "lat": 28.5677, "lng": 77.2436},
    "CAM-08": {"name": "Kashmiri Gate",    "lat": 28.6677, "lng": 77.2283},
}

BLACKLISTED_PLATES: set[str] = {"DL3CAB9999", "DL08CX9901"}

# Camera 7 is the simulated offline camera (matches LiveCameras.jsx)
OFFLINE_CAMERAS: set[str] = {"CAM-07"}

# ─── Load CSVs ────────────────────────────────────────────────────────────────
_BASE = Path(__file__).parent

def _load_csv(rel_path: str, required_cols: list[str]) -> pd.DataFrame:
    p = _BASE / rel_path
    if not p.exists():
        # Return empty frame with required columns so the API still runs
        return pd.DataFrame(columns=required_cols)
    df = pd.read_csv(p)
    # Keep only columns that actually exist
    existing = [c for c in required_cols if c in df.columns]
    return df[existing].copy()


_anpr_df   = _load_csv("anpr_output/anpr_results.csv",
                        ["track_id", "plate_text", "camera_id", "confidence", "frame"])
_track_df  = _load_csv("bytetrack_output/vehicle_tracking.csv",
                        ["track_id", "frame_id", "x1", "y1", "x2", "y2", "class_name"])
_detect_df = _load_csv("yolo_output/vehicle_detections.csv",
                        ["frame_id", "class_name", "confidence", "x1", "y1", "x2", "y2"])

# Drop rows with null plate_text
_anpr_df = _anpr_df.dropna(subset=["plate_text"])
if "plate_text" in _anpr_df.columns:
    _anpr_df["plate_text"] = _anpr_df["plate_text"].str.strip().str.upper()

# ─── Synthetic timestamp helper ───────────────────────────────────────────────
_BASE_TIME = datetime.now().replace(hour=8, minute=0, second=0, microsecond=0)


def _row_timestamp(idx: int) -> str:
    """Spread rows evenly across the last 8 hours."""
    offset_s = int((idx / max(len(_anpr_df), 1)) * 8 * 3600)
    return (_BASE_TIME + timedelta(seconds=offset_s)).strftime("%H:%M:%S")


# ─── Public helpers ───────────────────────────────────────────────────────────

def get_plate_reads(limit: int = 50) -> list[dict[str, Any]]:
    df = _anpr_df.tail(limit).copy()
    records = []
    for idx, row in df.iterrows():
        cam_id   = str(row.get("camera_id", "CAM-01"))
        cam_meta = CAMERAS.get(cam_id, CAMERAS["CAM-01"])
        plate    = str(row.get("plate_text", "UNKNOWN"))
        records.append({
            "track_id":      int(row.get("track_id", 0)),
            "plate_text":    plate,
            "camera_id":     cam_id,
            "camera_name":   cam_meta["name"],
            "lat":           cam_meta["lat"],
            "lng":           cam_meta["lng"],
            "timestamp":     _row_timestamp(int(idx)),
            "confidence":    round(float(row.get("confidence", 0.0)), 3),
            "is_blacklisted": plate in BLACKLISTED_PLATES,
        })
    return list(reversed(records))  # newest first


def get_trajectory(plate: str) -> list[dict[str, Any]]:
    plate = plate.strip().upper()
    df    = _anpr_df[_anpr_df["plate_text"] == plate].copy()
    if df.empty:
        return []

    stops = []
    for i, (idx, row) in enumerate(df.iterrows()):
        cam_id   = str(row.get("camera_id", "CAM-01"))
        cam_meta = CAMERAS.get(cam_id, CAMERAS["CAM-01"])
        # Simulate a plausible speed (30–70 km/h, first stop has no speed)
        speed = round(random.uniform(30, 70), 1) if i > 0 else 0.0
        stops.append({
            "camera_id":   cam_id,
            "camera_name": cam_meta["name"],
            "lat":         cam_meta["lat"],
            "lng":         cam_meta["lng"],
            "timestamp":   _row_timestamp(int(idx)),
            "speed_kmh":   speed,
        })
    return stops


def get_stats() -> dict[str, Any]:
    total_vehicles      = len(_detect_df) if not _detect_df.empty else 2811
    unique_tracks       = _track_df["track_id"].nunique() if not _track_df.empty else 69
    unique_plates       = _anpr_df["plate_text"].nunique() if not _anpr_df.empty else 10
    blacklist_hits      = int(_anpr_df["plate_text"].isin(BLACKLISTED_PLATES).sum()) if not _anpr_df.empty else 2
    cameras_online      = len(CAMERAS) - len(OFFLINE_CAMERAS)
    return {
        "total_vehicles":      total_vehicles,
        "active_trajectories": unique_tracks,
        "unique_plates":       unique_plates,
        "avg_speed":           33,
        "active_alerts":       max(blacklist_hits, 1),
        "cameras_online":      cameras_online,
        "ocr_accuracy":        94.2,
    }


def get_cameras() -> list[dict[str, Any]]:
    result = []
    for cam_id, meta in CAMERAS.items():
        is_online = cam_id not in OFFLINE_CAMERAS
        cam_reads = _anpr_df[_anpr_df["camera_id"] == cam_id] if "camera_id" in _anpr_df.columns else pd.DataFrame()
        result.append({
            "id":          cam_id,
            "name":        meta["name"],
            "lat":         meta["lat"],
            "lng":         meta["lng"],
            "status":      "ACTIVE" if is_online else "OFFLINE",
            "reads_today": len(cam_reads),
            "accuracy":    round(random.uniform(92.0, 97.5), 1),
            "resolution":  "1080P",
            "last_active": datetime.now().strftime("%H:%M:%S") if is_online else "DISCONNECTED",
        })
    return result


def get_alerts() -> list[dict[str, Any]]:
    alerts = []
    alert_id = 1

    # Blacklisted plate alerts
    if not _anpr_df.empty and "plate_text" in _anpr_df.columns:
        bl_rows = _anpr_df[_anpr_df["plate_text"].isin(BLACKLISTED_PLATES)]
        for idx, row in bl_rows.head(5).iterrows():
            plate    = str(row["plate_text"])
            cam_id   = str(row.get("camera_id", "CAM-01"))
            cam_name = CAMERAS.get(cam_id, CAMERAS["CAM-01"])["name"]
            alerts.append({
                "id":        alert_id,
                "type":      "BLACKLIST",
                "severity":  "CRITICAL",
                "message":   f"Blacklisted vehicle {plate} detected at {cam_name}",
                "plate":     plate,
                "camera_id": cam_id,
                "timestamp": _row_timestamp(int(idx)),
                "resolved":  False,
            })
            alert_id += 1

    # Offline camera alert
    alerts.append({
        "id":        alert_id,
        "type":      "HARDWARE",
        "severity":  "WARNING",
        "message":   "CAM-07 (Lajpat Nagar) — heartbeat timeout",
        "plate":     None,
        "camera_id": "CAM-07",
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "resolved":  False,
    })
    alert_id += 1

    # High-speed anomaly (synthetic)
    alerts.append({
        "id":        alert_id,
        "type":      "SPEED",
        "severity":  "WARNING",
        "message":   "Vehicle HR26DQ5521 detected at 94 km/h — exceeds 80 km/h limit",
        "plate":     "HR26DQ5521",
        "camera_id": "CAM-03",
        "timestamp": datetime.now().replace(minute=datetime.now().minute - 5).strftime("%H:%M:%S"),
        "resolved":  False,
    })

    return alerts


def get_hourly_counts() -> list[dict[str, Any]]:
    """Return 24-hour vehicle count distribution (synthetic + shaped)."""
    # Realistic Delhi traffic curve
    base_counts = [
        120, 80, 60, 45, 55, 140, 380, 720, 910, 860,
        780, 750, 830, 790, 760, 820, 950, 1020, 880, 670,
        520, 420, 310, 200,
    ]
    return [
        {"hour": f"{h:02d}:00", "count": base_counts[h] + random.randint(-20, 20)}
        for h in range(24)
    ]


def get_congestion() -> list[dict[str, Any]]:
    """Return simulated congestion % per road segment."""
    segments = [
        ("CAM-01", "CAM-03", "Connaught Place → ITO",       87),
        ("CAM-03", "CAM-02", "ITO → India Gate",            72),
        ("CAM-04", "CAM-01", "Karol Bagh → Connaught Pl",   65),
        ("CAM-02", "CAM-05", "India Gate → AIIMS",          58),
        ("CAM-05", "CAM-06", "AIIMS → Dhaula Kuan",         44),
        ("CAM-06", "CAM-04", "Dhaula Kuan → Karol Bagh",    39),
        ("CAM-08", "CAM-01", "Kashmiri Gate → Connaught",   51),
    ]
    return [
        {
            "segment":    label,
            "from_cam":   f,
            "to_cam":     t,
            "percentage": pct + random.randint(-3, 3),
        }
        for f, t, label, pct in segments
    ]


def get_heatmap() -> list[dict[str, Any]]:
    """Return heatmap intensity per camera based on read counts."""
    result = []
    total = max(len(_anpr_df), 1)
    for cam_id, meta in CAMERAS.items():
        if "camera_id" in _anpr_df.columns:
            count = int((_anpr_df["camera_id"] == cam_id).sum())
        else:
            count = random.randint(10, 60)
        result.append({
            "camera_id": cam_id,
            "name":      meta["name"],
            "lat":       meta["lat"],
            "lng":       meta["lng"],
            "intensity": round(count / total, 4),
            "count":     count,
        })
    return result


# ─── WebSocket live stream helpers ────────────────────────────────────────────
def ws_plate_event(idx: int) -> dict[str, Any]:
    """Return a single plate-read event from the CSV in rotation."""
    if _anpr_df.empty:
        # Fallback synthetic row
        plate  = random.choice(list(BLACKLISTED_PLATES) + ["PB10XX1234", "MH12AB5678"])
        cam_id = random.choice(list(CAMERAS.keys()))
    else:
        row    = _anpr_df.iloc[idx % len(_anpr_df)]
        plate  = str(row.get("plate_text", "UNKNOWN"))
        cam_id = str(row.get("camera_id", "CAM-01"))

    cam_meta = CAMERAS.get(cam_id, CAMERAS["CAM-01"])
    return {
        "type":          "plate_read",
        "plate_text":    plate,
        "camera_id":     cam_id,
        "camera_name":   cam_meta["name"],
        "lat":           cam_meta["lat"],
        "lng":           cam_meta["lng"],
        "timestamp":     datetime.now().strftime("%H:%M:%S"),
        "confidence":    round(random.uniform(0.88, 0.98), 3),
        "is_blacklisted": plate in BLACKLISTED_PLATES,
    }


def ws_alert_event() -> dict[str, Any]:
    plate  = random.choice(list(BLACKLISTED_PLATES))
    cam_id = random.choice([c for c in CAMERAS if c not in OFFLINE_CAMERAS])
    return {
        "type":      "alert",
        "severity":  "CRITICAL",
        "message":   f"Blacklisted vehicle {plate} detected",
        "plate_text": plate,
        "camera_id": cam_id,
        "camera_name": CAMERAS[cam_id]["name"],
        "timestamp": datetime.now().strftime("%H:%M:%S"),
    }
