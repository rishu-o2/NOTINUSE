import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import {
  mockCameras,
  mockAlerts,
  mockHourlyTraffic,
  mockCongestedSegments
} from '../data/mockData';

export default function Dashboard() {
  const navigate = useNavigate();

  // Dynamic stat values updated every 3s
  const [totalVehicles, setTotalVehicles] = useState(1284);
  const [activeTrajectories, setActiveTrajectories] = useState(327);
  const [avgSpeed, setAvgSpeed] = useState(32);
  const [activeAlertCount, setActiveAlertCount] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalVehicles((prev) => prev + Math.floor(Math.random() * 7) - 3);
      setActiveTrajectories((prev) => prev + Math.floor(Math.random() * 5) - 2);
      setAvgSpeed((prev) => Math.max(22, Math.min(45, prev + (Math.random() > 0.5 ? 1 : -1))));
      setActiveAlertCount((prev) => Math.max(2, Math.min(7, prev + (Math.random() > 0.7 ? 1 : -1))));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Road paths connecting cameras for visualization
  const activeRoads = [
    [mockCameras[0].pos, mockCameras[1].pos],
    [mockCameras[1].pos, mockCameras[4].pos],
    [mockCameras[2].pos, mockCameras[7].pos],
    [mockCameras[3].pos, mockCameras[0].pos],
    [mockCameras[4].pos, mockCameras[5].pos]
  ];

  return (
    <div className="w-screen h-screen bg-[#0f1117] flex overflow-hidden select-none">
      <Sidebar />

      <div className="flex-1 ml-[220px] h-screen flex flex-col overflow-y-auto">
        <Topbar breadcrumb="Dashboard" />

        <div className="p-6 space-y-6">
          {/* SECTION 1: Stat Cards (4 in a row) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="p-4 bg-[#1a1f2e] border border-[#252d3d] rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs text-[#64748b] font-medium">Total Vehicles</div>
                <div className="text-2xl font-bold text-[#f1f5f9] mt-1">
                  {totalVehicles.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#22c55e] mt-1 font-mono">+3.8% vs last hr</div>
              </div>
              <div className="w-10 h-10 rounded bg-[#141821] border border-[#252d3d] flex items-center justify-center text-lg text-[#3b82f6]">
                🚗
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-4 bg-[#1a1f2e] border border-[#252d3d] rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs text-[#64748b] font-medium">Active Trajectories</div>
                <div className="text-2xl font-bold text-[#3b82f6] mt-1">
                  {activeTrajectories}
                </div>
                <div className="text-[11px] text-[#64748b] mt-1 font-mono">Correlated across 8 nodes</div>
              </div>
              <div className="w-10 h-10 rounded bg-[#141821] border border-[#252d3d] flex items-center justify-center text-lg text-[#3b82f6]">
                📍
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-4 bg-[#1a1f2e] border border-[#252d3d] rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs text-[#64748b] font-medium">Avg Corridor Speed</div>
                <div className="text-2xl font-bold text-[#f1f5f9] mt-1">
                  {avgSpeed} <span className="text-sm font-normal text-[#64748b]">km/h</span>
                </div>
                <div className="text-[11px] text-[#f59e0b] mt-1 font-mono">Peak congestion active</div>
              </div>
              <div className="w-10 h-10 rounded bg-[#141821] border border-[#252d3d] flex items-center justify-center text-lg text-[#f59e0b]">
                ⚡
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-4 bg-[#1a1f2e] border border-[#252d3d] rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs text-[#64748b] font-medium">Active Alerts</div>
                <div className="text-2xl font-bold text-[#ef4444] mt-1">
                  {activeAlertCount}
                </div>
                <div className="text-[11px] text-[#ef4444] mt-1 font-mono">1 critical blacklist hit</div>
              </div>
              <div className="w-10 h-10 rounded bg-[#141821] border border-[#252d3d] flex items-center justify-center text-lg text-[#ef4444]">
                🚨
              </div>
            </div>
          </div>

          {/* SECTION 2: Map + Alerts (Side by Side) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* LEFT (65%): Map */}
            <div className="lg:col-span-8 bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-4 flex flex-col h-[380px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#252d3d] mb-3">
                <div className="text-xs font-semibold text-[#f1f5f9] flex items-center gap-2">
                  <span>🗺️</span> Delhi Grid Surveillance Map
                </div>
                <div className="text-[11px] text-[#64748b] font-mono">
                  8 Surveillance Intersections
                </div>
              </div>

              <div className="flex-1 rounded border border-[#252d3d] overflow-hidden">
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

                  {/* Active Road Lines */}
                  {activeRoads.map((pts, i) => (
                    <Polyline
                      key={i}
                      positions={pts}
                      pathOptions={{ color: '#3b82f6', weight: 2, opacity: 0.6 }}
                    />
                  ))}

                  {/* 8 Camera Markers */}
                  {mockCameras.map((cam) => (
                    <CircleMarker
                      key={cam.id}
                      center={cam.pos}
                      radius={7}
                      pathOptions={{
                        fillColor: cam.status === 'ACTIVE' ? '#3b82f6' : '#f59e0b',
                        fillOpacity: 1,
                        color: '#0f1117',
                        weight: 2
                      }}
                    >
                      <Popup>
                        <div className="text-xs p-1 font-mono text-slate-900">
                          <div className="font-bold text-blue-600">{cam.code}: {cam.name}</div>
                          <div>Status: {cam.status}</div>
                          <div>Reads Today: {cam.readsToday.toLocaleString()}</div>
                          <div>Accuracy: {cam.accuracy}%</div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* RIGHT (35%): Recent Alerts Panel */}
            <div className="lg:col-span-4 bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-4 flex flex-col h-[380px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#252d3d] mb-3">
                <div className="text-xs font-semibold text-[#f1f5f9] flex items-center gap-2">
                  <span>🚨</span> Recent Alerts
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ef4444]/20 text-[#ef4444] font-mono">
                  LIVE
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {mockAlerts.slice(0, 4).map((alert) => {
                  const borderCol =
                    alert.severity === 'critical'
                      ? 'border-l-4 border-l-[#ef4444]'
                      : alert.severity === 'warning'
                      ? 'border-l-4 border-l-[#f59e0b]'
                      : 'border-l-4 border-l-[#3b82f6]';

                  return (
                    <div
                      key={alert.id}
                      className={`p-2.5 bg-[#141821] border border-[#252d3d] ${borderCol} rounded text-xs`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[#f1f5f9]">{alert.type}</span>
                        <span className="text-[10px] font-mono text-[#64748b]">{alert.time}</span>
                      </div>
                      <div className="text-[11px] text-[#64748b] line-clamp-2 leading-relaxed">
                        {alert.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => navigate('/alerts')}
                className="w-full mt-3 py-2 bg-[#141821] hover:bg-[#252d3d] border border-[#252d3d] text-xs text-[#f1f5f9] rounded font-medium transition-colors"
              >
                View All Alerts →
              </button>
            </div>
          </div>

          {/* SECTION 3: Analytics Row (3 Cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chart 1: Traffic Flow (24h) */}
            <div className="bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-4 h-[240px] flex flex-col">
              <div className="text-xs font-semibold text-[#f1f5f9] mb-1">
                Traffic Flow (24 Hours)
              </div>
              <div className="text-[11px] text-[#64748b] mb-2">Hourly vehicle volume distribution</div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockHourlyTraffic.slice(10, 22)}>
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#141821', borderColor: '#252d3d', fontSize: '11px', borderRadius: '4px' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Top Congested Roads */}
            <div className="bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-4 h-[240px] flex flex-col">
              <div className="text-xs font-semibold text-[#f1f5f9] mb-1">
                Top Congested Segments
              </div>
              <div className="text-[11px] text-[#64748b] mb-2">Real-time corridor saturation percentage</div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockCongestedSegments.slice(0, 4)} layout="vertical">
                    <XAxis type="number" stroke="#64748b" fontSize={10} domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={90} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#141821', borderColor: '#252d3d', fontSize: '11px', borderRadius: '4px' }}
                    />
                    <Bar dataKey="congestion" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card 3: ANPR OCR Performance Metric */}
            <div className="bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-4 h-[240px] flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-[#f1f5f9] mb-1">
                  ANPR Engine Accuracy
                </div>
                <div className="text-[11px] text-[#64748b]">Real-time optical character recognition metric</div>
              </div>

              <div className="my-auto text-center">
                <div className="text-4xl font-bold text-[#22c55e]">94.2%</div>
                <div className="text-xs text-[#64748b] mt-1 font-mono">142,830 plates scanned today</div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#252d3d] text-center">
                <div className="bg-[#141821] p-2 rounded border border-[#252d3d]">
                  <div className="text-[10px] text-[#64748b]">CONFIDENCE</div>
                  <div className="text-xs font-bold text-[#f1f5f9] mt-0.5">0.96 Avg</div>
                </div>
                <div className="bg-[#141821] p-2 rounded border border-[#252d3d]">
                  <div className="text-[10px] text-[#64748b]">LATENCY</div>
                  <div className="text-xs font-bold text-[#3b82f6] mt-0.5">18 ms</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
