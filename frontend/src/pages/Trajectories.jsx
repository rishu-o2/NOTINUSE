import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import Sidebar from '../components/Sidebar';

// 8 Delhi Camera Locations
const DELHI_CAMERAS = [
  { id: 'C1', name: 'Connaught Place Outer Circle', pos: [28.6328, 77.2197] },
  { id: 'C2', name: 'India Gate Radial Spine', pos: [28.6129, 77.2295] },
  { id: 'C3', name: 'ITO Junction Major', pos: [28.6289, 77.2415] },
  { id: 'C4', name: 'Karol Bagh Pusa Road', pos: [28.6448, 77.1895] },
  { id: 'C5', name: 'AIIMS Ring Road Flyover', pos: [28.5672, 77.2100] },
  { id: 'C6', name: 'Dhaula Kuan Arterial Intersect', pos: [28.5921, 77.1563] },
  { id: 'C7', name: 'Lajpat Nagar Central Market', pos: [28.5700, 77.2435] },
  { id: 'C8', name: 'Kashmiri Gate ISBT Junction', pos: [28.6675, 77.2290] }
];

// Pre-configured vehicle trajectories
const MOCK_JOURNEYS = {
  'DL 01 AB 1234': {
    plate: 'DL 01 AB 1234',
    model: 'Hyundai Creta (White)',
    isBlacklisted: false,
    totalDistance: '14.2 km',
    travelTime: '24 mins',
    avgSpeed: '35.5 km/h',
    route: [
      { camera: 'C4', timestamp: '14:10:22', speed: '42 km/h', location: 'Karol Bagh Pusa Road', pos: [28.6448, 77.1895] },
      { camera: 'C1', timestamp: '14:16:45', speed: '34 km/h', location: 'Connaught Place Outer Circle', pos: [28.6328, 77.2197] },
      { camera: 'C2', timestamp: '14:23:10', speed: '38 km/h', location: 'India Gate Radial Spine', pos: [28.6129, 77.2295] },
      { camera: 'C7', timestamp: '14:34:20', speed: '28 km/h', location: 'Lajpat Nagar Central Market', pos: [28.5700, 77.2435] }
    ]
  },
  'DL 08 CX 9901': {
    plate: 'DL 08 CX 9901',
    model: 'Toyota Fortuner (Black)',
    isBlacklisted: true,
    flagReason: 'Hotlist: Stolen Vehicle / Surveillance Notice #409',
    totalDistance: '21.6 km',
    travelTime: '31 mins',
    avgSpeed: '41.8 km/h',
    route: [
      { camera: 'C8', timestamp: '13:50:11', speed: '55 km/h', location: 'Kashmiri Gate ISBT Junction', pos: [28.6675, 77.2290] },
      { camera: 'C3', timestamp: '13:59:30', speed: '48 km/h', location: 'ITO Junction Major', pos: [28.6289, 77.2415] },
      { camera: 'C2', timestamp: '14:06:12', speed: '39 km/h', location: 'India Gate Radial Spine', pos: [28.6129, 77.2295] },
      { camera: 'C5', timestamp: '14:15:40', speed: '44 km/h', location: 'AIIMS Ring Road Flyover', pos: [28.5672, 77.2100] },
      { camera: 'C6', timestamp: '14:21:05', speed: '52 km/h', location: 'Dhaula Kuan Arterial Intersect', pos: [28.5921, 77.1563] }
    ]
  }
};

// Custom camera icon creator
const createCameraIcon = (label, active = false) => {
  return L.divIcon({
    className: 'custom-camera-pin',
    html: `
      <div style="
        background: ${active ? '#00d4ff' : 'rgba(5, 10, 24, 0.9)'};
        color: ${active ? '#050a18' : '#00d4ff'};
        border: 2px solid #00d4ff;
        box-shadow: 0 0 ${active ? '20px #00d4ff' : '8px rgba(0,212,255,0.4)'};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: monospace;
        font-size: 11px;
        font-weight: bold;
      ">
        ${label}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

export default function Trajectories() {
  const [searchPlate, setSearchPlate] = useState('DL 01 AB 1234');
  const [activeJourney, setActiveJourney] = useState(MOCK_JOURNEYS['DL 01 AB 1234']);
  const [movingPos, setMovingPos] = useState(null);
  const [animProgress, setAnimProgress] = useState(0);

  const handleSearch = (e) => {
    e.preventDefault();
    const cleanQuery = searchPlate.trim().toUpperCase();
    if (!cleanQuery) return;

    if (MOCK_JOURNEYS[cleanQuery]) {
      setActiveJourney(MOCK_JOURNEYS[cleanQuery]);
    } else {
      // Generate a dynamic realistic route for any searched plate
      const randomRoute = [
        DELHI_CAMERAS[0],
        DELHI_CAMERAS[1],
        DELHI_CAMERAS[4],
        DELHI_CAMERAS[5]
      ].map((cam, idx) => ({
        camera: cam.id,
        timestamp: `14:${20 + idx * 6}:${Math.floor(Math.random() * 50 + 10)}`,
        speed: `${Math.floor(Math.random() * 25 + 30)} km/h`,
        location: cam.name,
        pos: cam.pos
      }));

      setActiveJourney({
        plate: cleanQuery,
        model: 'Generic Vehicle (Grey)',
        isBlacklisted: false,
        totalDistance: '12.8 km',
        travelTime: '18 mins',
        avgSpeed: '38.0 km/h',
        route: randomRoute
      });
    }
  };

  // Moving animated vehicle marker along the trajectory
  useEffect(() => {
    if (!activeJourney || !activeJourney.route || activeJourney.route.length < 2) {
      setMovingPos(null);
      return;
    }

    const route = activeJourney.route;
    let step = 0;
    const totalSteps = 100;

    const interval = setInterval(() => {
      step = (step + 1) % totalSteps;
      const progress = step / totalSteps;
      setAnimProgress(progress);

      const segmentCount = route.length - 1;
      const segIndex = Math.min(Math.floor(progress * segmentCount), segmentCount - 1);
      const segProgress = (progress * segmentCount) - segIndex;

      const p1 = route[segIndex].pos;
      const p2 = route[segIndex + 1].pos;

      const lat = p1[0] + (p2[0] - p1[0]) * segProgress;
      const lng = p1[1] + (p2[1] - p1[1]) * segProgress;

      setMovingPos([lat, lng]);
    }, 80);

    return () => clearInterval(interval);
  }, [activeJourney]);

  const polylinePositions = activeJourney ? activeJourney.route.map((r) => r.pos) : [];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050a18] flex select-none">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-[210px] h-screen flex flex-col p-6 overflow-hidden">
        {/* Top Header & Search Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-white font-bold text-xl flex items-center gap-2">
                <span className="text-[#00d4ff]">📍</span> Vehicle Trajectory Tracking
              </h1>
              <p className="text-gray-400 text-xs font-mono mt-0.5">
                Multi-camera timestamp correlation & route reconstruction
              </p>
            </div>
            {/* Quick suggestions */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-gray-400">Quick Track:</span>
              <button
                onClick={() => {
                  setSearchPlate('DL 01 AB 1234');
                  setActiveJourney(MOCK_JOURNEYS['DL 01 AB 1234']);
                }}
                className="px-2 py-1 rounded bg-white/[0.05] hover:bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30 transition-all"
              >
                DL 01 AB 1234
              </button>
              <button
                onClick={() => {
                  setSearchPlate('DL 08 CX 9901');
                  setActiveJourney(MOCK_JOURNEYS['DL 08 CX 9901']);
                }}
                className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 transition-all"
              >
                DL 08 CX 9901 (Hotlist)
              </button>
            </div>
          </div>

          {/* Search Row */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value)}
                placeholder="Enter License Plate Number (e.g., DL 01 AB 1234)"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] backdrop-blur-md border border-[#00d4ff]/30 text-white text-sm font-mono placeholder-gray-500 focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/50 shadow-[0_0_20px_rgba(0,212,255,0.05)]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">
                AUTO-OCR CORRELATED
              </span>
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0088cc] hover:from-[#33ddff] hover:to-[#00aaff] text-[#050a18] font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,212,255,0.3)] active:scale-95 flex items-center gap-2"
            >
              <span>🔍</span> Track Vehicle
            </button>
          </form>
        </div>

        {/* Two-Panel Layout */}
        <div className="flex-1 flex gap-5 min-h-0">
          {/* LEFT PANEL (60%): Interactive Leaflet Map */}
          <div className="w-[60%] h-full rounded-2xl overflow-hidden border border-[#00d4ff]/25 shadow-[0_0_30px_rgba(0,212,255,0.08)] relative">
            <MapContainer
              center={[28.6139, 77.2090]}
              zoom={12}
              className="w-full h-full"
              style={{ background: '#050a18' }}
            >
              {/* Dark Matter Basemap */}
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {/* All 8 Camera Locations */}
              {DELHI_CAMERAS.map((cam) => {
                const isOnRoute = activeJourney?.route.some((r) => r.camera === cam.id);
                return (
                  <Marker
                    key={cam.id}
                    position={cam.pos}
                    icon={createCameraIcon(cam.id, isOnRoute)}
                  >
                    <Popup className="custom-dark-popup">
                      <div className="p-1 font-mono text-xs text-slate-800">
                        <div className="font-bold text-[#0088cc]">{cam.id}: {cam.name}</div>
                        <div>Status: Active Surveillance</div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Animated / Glowing Polyline when route active */}
              {polylinePositions.length > 0 && (
                <>
                  {/* Outer Glow Line */}
                  <Polyline
                    positions={polylinePositions}
                    pathOptions={{
                      color: activeJourney?.isBlacklisted ? '#ef4444' : '#00d4ff',
                      weight: 8,
                      opacity: 0.35,
                      lineCap: 'round'
                    }}
                  />
                  {/* Inner Solid Line */}
                  <Polyline
                    positions={polylinePositions}
                    pathOptions={{
                      color: activeJourney?.isBlacklisted ? '#f87171' : '#ffffff',
                      weight: 3,
                      opacity: 0.9,
                      dashArray: '8, 8'
                    }}
                  />
                </>
              )}

              {/* Moving Vehicle Dot */}
              {movingPos && (
                <CircleMarker
                  center={movingPos}
                  radius={7}
                  pathOptions={{
                    fillColor: activeJourney?.isBlacklisted ? '#ef4444' : '#00d4ff',
                    fillOpacity: 1,
                    color: '#ffffff',
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="text-xs font-mono p-1">
                      🚗 <strong>{activeJourney?.plate}</strong> (Live Tracking)
                    </div>
                  </Popup>
                </CircleMarker>
              )}
            </MapContainer>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-[#050a18]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-[#00d4ff]/20 text-[11px] font-mono text-gray-300 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full border border-[#00d4ff] bg-[#00d4ff]/30" />
                <span>Camera Nodes (C1 - C8)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-[#00d4ff]" />
                <span>Reconstructed Trajectory</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL (40%): Journey Details */}
          <div className="w-[40%] h-full flex flex-col gap-4 overflow-y-auto pr-1">
            {activeJourney ? (
              <>
                {/* Vehicle Info Card */}
                <div className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-[16px] border border-[#00d4ff]/20 shadow-[0_0_25px_rgba(0,212,255,0.06)]">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#00d4ff]">
                        TARGET IDENTIFIER
                      </div>
                      <div className="text-2xl font-black text-white font-mono mt-0.5">
                        {activeJourney.plate}
                      </div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">
                        {activeJourney.model}
                      </div>
                    </div>
                    {/* Blacklist Status */}
                    {activeJourney.isBlacklisted ? (
                      <div className="px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
                        <span>⚠️</span> BLACKLISTED
                      </div>
                    ) : (
                      <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
                        <span>✓</span> VERIFIED CLEAN
                      </div>
                    )}
                  </div>

                  {activeJourney.flagReason && (
                    <div className="mt-3 p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono">
                      {activeJourney.flagReason}
                    </div>
                  )}

                  {/* Summary Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10 text-center font-mono">
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] text-gray-400">DISTANCE</div>
                      <div className="text-sm font-bold text-[#00d4ff] mt-0.5">
                        {activeJourney.totalDistance}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] text-gray-400">DURATION</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {activeJourney.travelTime}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] text-gray-400">AVG SPEED</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">
                        {activeJourney.avgSpeed}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Journey Log Table */}
                <div className="flex-1 p-5 rounded-2xl bg-white/[0.04] backdrop-blur-[16px] border border-[#00d4ff]/20 shadow-[0_0_25px_rgba(0,212,255,0.06)] flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>🕒</span> Detection Timeline ({activeJourney.route.length} Sights)
                    </div>
                    <span className="text-[10px] font-mono text-[#00d4ff]">
                      CHRONOLOGICAL
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {activeJourney.route.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between font-mono text-xs hover:border-[#00d4ff]/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md bg-[#00d4ff]/20 text-[#00d4ff] flex items-center justify-center font-bold text-[11px]">
                            {item.camera}
                          </div>
                          <div>
                            <div className="text-white font-semibold truncate max-w-[140px]">
                              {item.location}
                            </div>
                            <div className="text-[10px] text-gray-400">{item.timestamp}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-cyan-300">
                            {item.speed}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Export Button */}
                  <button
                    onClick={() => alert(`Exporting trajectory log for ${activeJourney.plate}...`)}
                    className="w-full mt-4 py-2.5 rounded-xl bg-[#00d4ff]/15 hover:bg-[#00d4ff]/25 border border-[#00d4ff]/40 text-[#00d4ff] font-mono text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,212,255,0.15)] active:scale-98"
                  >
                    <span>📥</span> Download Intelligence Report
                  </button>
                </div>
              </>
            ) : (
              /* Default Empty State */
              <div className="flex-1 p-8 rounded-2xl bg-white/[0.04] backdrop-blur-[16px] border border-[#00d4ff]/20 flex flex-col items-center justify-center text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-white font-bold text-sm">No Target Selected</h3>
                <p className="text-gray-400 text-xs font-mono mt-1 max-w-[220px]">
                  Enter a plate number above to track vehicle journey across cameras.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
