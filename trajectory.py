import math
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import PlateRead, Camera


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS points in kilometers."""
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


def estimate_speed(
    lat1: float, lon1: float, lat2: float, lon2: float, t1: datetime, t2: datetime
) -> float:
    """Estimates vehicle speed in km/h based on GPS coordinates and timestamps."""
    dist_km = haversine_distance(lat1, lon1, lat2, lon2)
    time_diff_hours = abs((t2 - t1).total_seconds()) / 3600.0

    if time_diff_hours <= 0.0001:
        return 0.0

    speed = dist_km / time_diff_hours
    return round(speed, 2)


async def get_trajectory(db: AsyncSession, plate_text: str) -> Dict[str, Any]:
    """Retrieves full chronological journey trajectory for a target license plate."""
    stmt = (
        select(PlateRead)
        .where(PlateRead.plate_text == plate_text.strip().upper())
        .order_by(PlateRead.timestamp.asc())
    )
    result = await db.execute(stmt)
    reads = result.scalars().all()

    if not reads:
        return {
            "plate": plate_text.upper(),
            "found": False,
            "stops": [],
            "total_distance_km": 0.0,
            "duration_mins": 0.0,
            "avg_speed_kmh": 0.0,
            "status": "Not Found"
        }

    # Fetch camera details
    cam_result = await db.execute(select(Camera))
    cams = {c.id: c for c in cam_result.scalars().all()}

    stops = []
    total_dist = 0.0

    for i, read in enumerate(reads):
        cam = cams.get(read.camera_id)
        cam_name = cam.name if cam else read.camera_id
        lat = read.camera_lat or (cam.lat if cam else 28.6139)
        lng = read.camera_lng or (cam.lng if cam else 77.2090)

        # Calculate step distance
        if i > 0:
            prev_lat = stops[-1]["lat"]
            prev_lng = stops[-1]["lng"]
            total_dist += haversine_distance(prev_lat, prev_lng, lat, lng)

        stops.append({
            "camera_id": read.camera_id,
            "camera_name": cam_name,
            "lat": lat,
            "lng": lng,
            "timestamp": read.timestamp.isoformat() if read.timestamp else None,
            "time_formatted": read.timestamp.strftime("%H:%M:%S") if read.timestamp else "N/A",
            "speed_kmh": read.speed_kmh,
            "vehicle_type": read.vehicle_type,
            "confidence": read.confidence,
            "image_path": read.image_path
        })

    first_time = reads[0].timestamp
    last_time = reads[-1].timestamp
    duration_mins = (
        round(abs((last_time - first_time).total_seconds()) / 60.0, 1)
        if first_time and last_time
        else 0.0
    )

    avg_speed = (
        round(sum(r.speed_kmh for r in reads) / len(reads), 1)
        if reads
        else 0.0
    )

    is_blacklisted = any(r.is_blacklisted for r in reads)

    return {
        "plate": plate_text.upper(),
        "found": True,
        "is_blacklisted": is_blacklisted,
        "status": "Blacklist" if is_blacklisted else "Clear",
        "vehicle_type": reads[-1].vehicle_type,
        "total_distance_km": round(total_dist, 2),
        "duration_mins": duration_mins,
        "avg_speed_kmh": avg_speed,
        "total_sightings": len(stops),
        "stops": stops
    }
