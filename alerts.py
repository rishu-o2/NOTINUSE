from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import Alert, PlateRead
from config import BLACKLISTED_PLATES, ANOMALY_SPEED_THRESHOLD_KMH
from trajectory import estimate_speed


def check_blacklist(plate_text: str) -> bool:
    """Checks if a license plate exists in the NCR police hotlist."""
    clean_plate = plate_text.strip().upper().replace(" ", "").replace("-", "")
    for bl in BLACKLISTED_PLATES:
        if bl.replace(" ", "").replace("-", "") == clean_plate:
            return True
    return False


async def detect_anomaly(
    db: AsyncSession,
    plate_text: str,
    current_camera_id: str,
    current_timestamp: datetime,
    current_lat: float,
    current_lng: float
) -> Optional[Dict[str, Any]]:
    """Detects spatial-temporal anomalies (e.g., cloned plate or impossible velocity)."""
    stmt = (
        select(PlateRead)
        .where(
            PlateRead.plate_text == plate_text.strip().upper(),
            PlateRead.camera_id != current_camera_id
        )
        .order_by(PlateRead.timestamp.desc())
        .limit(1)
    )
    result = await db.execute(stmt)
    last_read = result.scalars().first()

    if not last_read or not last_read.camera_lat or not last_read.camera_lng:
        return None

    speed = estimate_speed(
        last_read.camera_lat,
        last_read.camera_lng,
        current_lat,
        current_lng,
        last_read.timestamp,
        current_timestamp
    )

    if speed > ANOMALY_SPEED_THRESHOLD_KMH:
        return {
            "type": "Cloned Plate / Impossible Velocity Anomaly",
            "severity": "critical",
            "message": f"Plate {plate_text} detected between {last_read.camera_id} and {current_camera_id} at impossible speed ({speed} km/h). Suspected duplicate plate.",
            "speed_kmh": speed,
            "last_camera": last_read.camera_id
        }

    return None


async def create_alert(
    db: AsyncSession,
    alert_type: str,
    severity: str,
    message: str,
    plate_text: Optional[str] = None,
    camera_id: Optional[str] = None
) -> Alert:
    """Creates a new incident alert record in the database."""
    alert = Alert(
        type=alert_type,
        severity=severity,
        message=message,
        plate_text=plate_text,
        camera_id=camera_id,
        timestamp=datetime.now(timezone.utc),
        is_resolved=False
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return alert


async def get_active_alerts(db: AsyncSession) -> List[Dict[str, Any]]:
    """Fetches all active unresolved alarms."""
    stmt = (
        select(Alert)
        .where(Alert.is_resolved == False)
        .order_by(Alert.timestamp.desc())
    )
    result = await db.execute(stmt)
    alerts = result.scalars().all()

    return [
        {
            "id": a.id,
            "type": a.type,
            "severity": a.severity,
            "message": a.message,
            "plate_text": a.plate_text,
            "camera_id": a.camera_id,
            "timestamp": a.timestamp.isoformat() if a.timestamp else None,
            "time_formatted": a.timestamp.strftime("%H:%M:%S") if a.timestamp else "N/A",
            "is_resolved": a.is_resolved
        }
        for a in alerts
    ]
