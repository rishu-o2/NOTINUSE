import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { mockCameras, mockTrajectories } from '../data/mockData';

export default function Trajectories() {
  const [searchPlate, setSearchPlate] = useState('PB10XX1234');
  const [activeJourney, setActiveJourney] = useState(mockTrajectories['PB10XX1234']);
  const [movingPos, setMovingPos] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchPlate.trim().toUpperCase();
    if (!query) {
      setActiveJourney(null);
      return;
    }

    if (mockTrajectories[query]) {
      setActiveJourney(mockTrajectories[query]);
    } else {
      // Dynamic fallback route for any input plate
      setActiveJourney({
        plate: query,
        model: 'Commercial Transport',
        status: 'Clear',
        totalDistance: '12.4 km',
        duration: '22 mins',
        avgSpeed: '33.8 km/h',
        stops: [
          { camera: 'CAM-04', location: 'Karol Bagh Pusa Road', time: '14:20:00', speed: '38 km/h', direction: 'East', pos: mockCameras[3].pos },
          { camera: 'CAM-01', location: 'Connaught Place Outer Circle', time: '14:29:10', speed: '30 km/h', direction: 'South-East', pos: mockCameras[0].pos },
          { camera: 'CAM-03', location: 'ITO Junction North Arterial', time: '14:38:40', speed: '34 km/h', direction: 'East', pos: mockCameras[2].pos }
        ]
      });
    }
  };

  // Interpolate vehicle marker along stops
  useEffect(() => {
    if (!activeJourney || !activeJourney.stops || activeJourney.stops.length < 2) {
      setMovingPos(null);
      return;
    }

    const stops = activeJourney.stops;
    let step = 0;
    const totalSteps = 100;

    const interval = setInterval(() => {
      step = (step + 1) % totalSteps;
      const progress = step / totalSteps;
      const segCount = stops.length - 1;
      const segIdx = Math.min(Math.floor(progress * segCount), segCount - 1);
      const segProg = (progress * segCount) - segIdx;

      const p1 = stops[segIdx].pos;
      const p2 = stops[segIdx + 1].pos;

      const lat = p1[0] + (p2[0] - p1[0]) * segProg;
      const lng = p1[1] + (p2[1] - p1[1]) * segProg;
      setMovingPos([lat, lng]);
    }, 100);

    return () => clearInterval(interval);
  }, [activeJourney]);

  const polylinePositions = activeJourney ? activeJourney.stops.map((s) => s.pos) : [];

  return (
    <div className="w-screen h-screen bg-[#0f1117] flex overflow-hidden select-none">
      <Sidebar />

      <div className="flex-1 ml-[220px] h-screen flex flex-col overflow-y-auto">
        <Topbar breadcrumb="Vehicle Trajectory Tracking" />

        <div className="p-6 space-y-4 flex-1 flex flex-col min-h-0">
          {/* Header & Search Bar */}
          <div className="bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div>
                <h1 className="text-base font-bold text-[#f1f5f9]">
                  Vehicle Trajectory Tracking
                </h1>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Multi-camera temporal trajectory correlation & route mapping
                </p>
              </div>

              <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="text"
                  value={searchPlate}
                  onChange={(e) => setSearchPlate(e.target.value)}
                  placeholder="Enter Plate Number (e.g. PB10XX1234)"
                  className="px-3 py-2 bg-[#141821] border border-[#252d3d] rounded text-xs text-[#f1f5f9] font-mono focus:outline-none focus:border-[#3b82f6] w-64"
                />
                <input
                  type="date"
                  defaultValue="2026-09-12"
                  className="px-3 py-2 bg-[#141821] border border-[#252d3d] rounded text-xs text-[#64748b] focus:outline-none focus:border-[#3b82f6]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3b82f6] hover:bg-blue-600 text-white rounded text-xs font-semibold transition-colors"
                >
                  Track Vehicle
                </button>
              </form>
            </div>
          </div>

          {/* Two Panel Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[480px]">
            {/* LEFT PANEL (60%): Map */}
            <div className="lg:col-span-7 bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-4 flex flex-col h-full">
              <div className="flex items-center justify-between pb-3 border-b border-[#252d3d] mb-3">
                <div className="text-xs font-semibold text-[#f1f5f9]">
                  Surveillance Map Visualization
                </div>
                <div className="text-[11px] text-[#64748b] font-mono">
                  Delhi Central Grid
                </div>
              </div>

              <div className="flex-1 rounded border border-[#252d3d] overflow-hidden relative">
                <MapContainer
                  center={[28.6139, 77.2090]}
                  zoom={12}
                  className="w-full h-full"
                  style={{ background: '#0f1117' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />

                  {/* 8 Camera Markers */}
                  {mockCameras.map((cam) => {
                    const isStop = activeJourney?.stops.some((s) => s.camera === cam.id);
                    return (
                      <CircleMarker
                        key={cam.id}
                        center={cam.pos}
                        radius={6}
                        pathOptions={{
                          fillColor: isStop ? '#3b82f6' : '#64748b',
                          fillOpacity: 1,
                          color: '#0f1117',
                          weight: 2
                        }}
                      >
                        <Popup>
                          <div className="text-xs font-mono p-1 text-slate-900">
                            <div className="font-bold">{cam.id}: {cam.name}</div>
                            <div>Status: {cam.status}</div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}

                  {/* Polyline Route */}
                  {polylinePositions.length > 0 && (
                    <Polyline
                      positions={polylinePositions}
                      pathOptions={{
                        color: activeJourney?.status === 'Blacklist' ? '#ef4444' : '#3b82f6',
                        weight: 3,
                        dashArray: '6, 6'
                      }}
                    />
                  )}

                  {/* Moving Vehicle Dot */}
                  {movingPos && (
                    <CircleMarker
                      center={movingPos}
                      radius={6}
                      pathOptions={{
                        fillColor: activeJourney?.status === 'Blacklist' ? '#ef4444' : '#22c55e',
                        fillOpacity: 1,
                        color: '#ffffff',
                        weight: 2
                      }}
                    >
                      <Popup>
                        <div className="text-xs font-mono p-1">
                          🚗 <strong>{activeJourney?.plate}</strong>
                        </div>
                      </Popup>
                    </CircleMarker>
                  )}
                </MapContainer>
              </div>
            </div>

            {/* RIGHT PANEL (40%): Journey Details */}
            <div className="lg:col-span-5 bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-4 flex flex-col justify-between overflow-y-auto">
              {activeJourney ? (
                <div className="space-y-4">
                  {/* Journey Header Card */}
                  <div className="p-4 bg-[#141821] border border-[#252d3d] rounded">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[10px] font-mono text-[#64748b]">TRACKED TARGET</div>
                        <div className="text-xl font-bold font-mono text-[#f1f5f9] mt-0.5">
                          {activeJourney.plate}
                        </div>
                        <div className="text-xs text-[#64748b] mt-0.5">{activeJourney.model}</div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium font-mono ${
                          activeJourney.status === 'Blacklist'
                            ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30'
                            : 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                        }`}
                      >
                        {activeJourney.status === 'Blacklist' ? 'BLACKLIST' : 'CLEAR'}
                      </span>
                    </div>

                    {activeJourney.warningReason && (
                      <div className="mt-2 text-xs text-[#ef4444] bg-[#ef4444]/10 p-2 rounded border border-[#ef4444]/20">
                        {activeJourney.warningReason}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#252d3d] text-center">
                      <div>
                        <div className="text-[10px] text-[#64748b]">DISTANCE</div>
                        <div className="text-xs font-bold text-[#f1f5f9] mt-0.5">{activeJourney.totalDistance}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#64748b]">DURATION</div>
                        <div className="text-xs font-bold text-[#f1f5f9] mt-0.5">{activeJourney.duration}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#64748b]">AVG SPEED</div>
                        <div className="text-xs font-bold text-[#22c55e] mt-0.5">{activeJourney.avgSpeed}</div>
                      </div>
                    </div>
                  </div>

                  {/* Camera Log Table */}
                  <div>
                    <div className="text-xs font-semibold text-[#f1f5f9] mb-2">
                      Camera Detection Timeline ({activeJourney.stops.length} Nodes)
                    </div>
                    <div className="border border-[#252d3d] rounded overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#141821] text-[#64748b] border-b border-[#252d3d]">
                          <tr>
                            <th className="p-2">Camera</th>
                            <th className="p-2">Location</th>
                            <th className="p-2">Time</th>
                            <th className="p-2">Speed</th>
                            <th className="p-2">Dir</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#252d3d]">
                          {activeJourney.stops.map((s, idx) => (
                            <tr key={idx} className="hover:bg-[#141821]/50 font-mono">
                              <td className="p-2 font-bold text-[#3b82f6]">{s.camera}</td>
                              <td className="p-2 text-[#f1f5f9] truncate max-w-[120px]">{s.location}</td>
                              <td className="p-2 text-[#64748b]">{s.time}</td>
                              <td className="p-2 text-[#f1f5f9]">{s.speed}</td>
                              <td className="p-2 text-[#64748b]">{s.direction}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Export Button */}
                  <button
                    onClick={() => alert(`Exporting trajectory log for ${activeJourney.plate}...`)}
                    className="w-full py-2 bg-[#141821] hover:bg-[#252d3d] border border-[#252d3d] text-xs font-medium text-[#f1f5f9] rounded transition-colors"
                  >
                    Export Forensic Report (PDF)
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#64748b]">
                  <div className="text-3xl mb-2">🔍</div>
                  <div className="text-xs text-[#f1f5f9] font-semibold">Enter a plate number</div>
                  <div className="text-[11px] mt-1">Search for a vehicle above to reconstruct its journey across the camera network.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
