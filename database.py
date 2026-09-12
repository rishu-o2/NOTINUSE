from datetime import datetime, timezone
from typing import AsyncGenerator
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.future import select

from config import DATABASE_URL, DELHI_CAMERAS, BLACKLISTED_PLATES

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()


class Camera(Base):
    __tablename__ = "cameras"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    location = Column(String(200), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    status = Column(String(50), default="ACTIVE")
    last_active = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class PlateRead(Base):
    __tablename__ = "plate_reads"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    plate_text = Column(String(50), index=True, nullable=False)
    camera_id = Column(String(50), index=True, nullable=False)
    camera_lat = Column(Float, nullable=True)
    camera_lng = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    speed_kmh = Column(Float, default=0.0)
    vehicle_type = Column(String(50), default="Sedan")
    confidence = Column(Float, default=0.95)
    is_blacklisted = Column(Boolean, default=False)
    image_path = Column(String(255), nullable=True)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    type = Column(String(100), nullable=False)
    severity = Column(String(50), default="warning")  # critical, warning, info
    message = Column(String(255), nullable=False)
    plate_text = Column(String(50), index=True, nullable=True)
    camera_id = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    is_resolved = Column(Boolean, default=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed Initial Cameras and Demo Data
    async with AsyncSessionLocal() as session:
        # Check existing cameras
        result = await session.execute(select(Camera))
        existing_cams = result.scalars().all()

        if not existing_cams:
            for cam_data in DELHI_CAMERAS:
                cam = Camera(
                    id=cam_data["id"],
                    name=cam_data["name"],
                    location=cam_data["location"],
                    lat=cam_data["lat"],
                    lng=cam_data["lng"],
                    status=cam_data["status"],
                    last_active=datetime.now(timezone.utc)
                )
                session.add(cam)

            # Seed demo trajectory for target PB10XX1234
            demo_stops = [
                {"cam": "CAM-06", "plate": "PB10XX1234", "speed": 48.0, "type": "Sedan (White)", "time_min_ago": 40},
                {"cam": "CAM-04", "plate": "PB10XX1234", "speed": 36.0, "type": "Sedan (White)", "time_min_ago": 28},
                {"cam": "CAM-01", "plate": "PB10XX1234", "speed": 32.0, "type": "Sedan (White)", "time_min_ago": 15},
                {"cam": "CAM-02", "plate": "PB10XX1234", "speed": 42.0, "type": "Sedan (White)", "time_min_ago": 2},
                
                # Blacklisted demo target
                {"cam": "CAM-08", "plate": "DL08CX9901", "speed": 64.0, "type": "SUV (Black)", "time_min_ago": 35},
                {"cam": "CAM-03", "plate": "DL08CX9901", "speed": 58.0, "type": "SUV (Black)", "time_min_ago": 20},
                {"cam": "CAM-05", "plate": "DL08CX9901", "speed": 78.0, "type": "SUV (Black)", "time_min_ago": 5},

                # Regular traffic reads
                {"cam": "CAM-01", "plate": "HR26DQ5521", "speed": 85.0, "type": "Sedan (Silver)", "time_min_ago": 10},
                {"cam": "CAM-02", "plate": "UP16AZ4120", "speed": 40.0, "type": "Hatchback (Red)", "time_min_ago": 8},
                {"cam": "CAM-03", "plate": "DL01AB1234", "speed": 34.0, "type": "SUV (White)", "time_min_ago": 4}
            ]

            cam_dict = {c["id"]: c for c in DELHI_CAMERAS}

            for stop in demo_stops:
                cam_info = cam_dict.get(stop["cam"], DELHI_CAMERAS[0])
                ts = datetime.now(timezone.utc).replace(microsecond=0)
                is_bl = stop["plate"] in BLACKLISTED_PLATES
                
                read_entry = PlateRead(
                    plate_text=stop["plate"],
                    camera_id=stop["cam"],
                    camera_lat=cam_info["lat"],
                    camera_lng=cam_info["lng"],
                    timestamp=ts,
                    speed_kmh=stop["speed"],
                    vehicle_type=stop["type"],
                    confidence=0.96,
                    is_blacklisted=is_bl,
                    image_path=f"/crops/{stop['plate']}_{stop['cam']}.jpg"
                )
                session.add(read_entry)

            # Seed demo active alerts
            session.add(Alert(
                type="Blacklist Violation",
                severity="critical",
                message="Flagged plate DL08CX9901 spotted at AIIMS Ring Road Flyover (CAM-05)",
                plate_text="DL08CX9901",
                camera_id="CAM-05",
                timestamp=datetime.now(timezone.utc),
                is_resolved=False
            ))

            session.add(Alert(
                type="Overspeed Violation",
                severity="warning",
                message="Vehicle HR26DQ5521 traveling at 85 km/h in 50 km/h corridor",
                plate_text="HR26DQ5521",
                camera_id="CAM-01",
                timestamp=datetime.now(timezone.utc),
                is_resolved=False
            ))

            session.add(Alert(
                type="Camera Node Inactive",
                severity="info",
                message="CAM-07 Lajpat Nagar disconnected from central surveillance grid",
                plate_text=None,
                camera_id="CAM-07",
                timestamp=datetime.now(timezone.utc),
                is_resolved=False
            ))

            await session.commit()
