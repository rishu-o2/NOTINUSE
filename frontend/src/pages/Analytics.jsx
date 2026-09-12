import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import {
  mockHourlyTraffic,
  mockSpeedDistribution,
  mockTopRoutes,
  mockCameras
} from '../data/mockData';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i}:00`);

// Congestion intensity matrix generator (7 days x 24 hours)
const generateHeatmapIntensity = (dayIdx, hourIdx) => {
  // Peak hours: 8-10am and 5-8pm on weekdays
  const isWeekday = dayIdx < 5;
  const isMorningPeak = hourIdx >= 8 && hourIdx <= 10;
  const isEveningPeak = hourIdx >= 17 && hourIdx <= 20;

  if (isWeekday && (isMorningPeak || isEveningPeak)) {
    return Math.random() > 0.3 ? 'bg-[#ef4444]' : 'bg-[#f59e0b]'; // High/Moderate
  }
  if (hourIdx >= 11 && hourIdx <= 16) {
    return Math.random() > 0.4 ? 'bg-[#f59e0b]' : 'bg-[#3b82f6]'; // Moderate/Normal
  }
  if (hourIdx >= 22 || hourIdx <= 5) {
    return 'bg-[#1a1f2e]'; // Low
  }
  return 'bg-[#3b82f6]';
};

export default function Analytics() {
  return (
    <div className="w-screen h-screen bg-[#0f1117] flex overflow-hidden select-none">
      <Sidebar />

      <div className="flex-1 ml-[220px] h-screen flex flex-col overflow-y-auto">
        <Topbar breadcrumb="Urban Traffic Analytics" />

        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-base font-bold text-[#f1f5f9]">
              Urban Traffic Intelligence & Statistical Analytics
            </h1>
            <p className="text-xs text-[#64748b] mt-0.5">
              Historical trends, corridor velocity distribution, and optical sensor performance
            </p>
          </div>

          {/* ROW 1: 2 Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Chart 1: 24h Area Chart */}
            <div className="bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-4 h-[280px] flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-xs font-semibold text-[#f1f5f9]">Hourly Vehicle Volume (24 Hours)</div>
                  <div className="text-[11px] text-[#64748b]">Total traffic flow count across surveillance corridors</div>
                </div>
                <span className="text-[10px] font-mono text-[#3b82f6] px-2 py-0.5 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded">
                  24H METRIC
                </span>
              </div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHourlyTraffic}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#141821', borderColor: '#252d3d', fontSize: '11px', borderRadius: '4px' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Speed Distribution */}
            <div className="bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-4 h-[280px] flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-xs font-semibold text-[#f1f5f9]">Corridor Velocity Distribution</div>
                  <div className="text-[11px] text-[#64748b]">Count of vehicles observed per velocity bracket</div>
                </div>
                <span className="text-[10px] font-mono text-[#22c55e] px-2 py-0.5 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded">
                  RADAR SCAN
                </span>
              </div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockSpeedDistribution}>
                    <XAxis dataKey="range" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#141821', borderColor: '#252d3d', fontSize: '11px', borderRadius: '4px' }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ROW 2: Heatmap + Origin-Destination */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Heatmap Grid */}
            <div className="bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-semibold text-[#f1f5f9]">Weekly Congestion Matrix (7 Days × 24h)</div>
                  <div className="text-[11px] text-[#64748b]">Spatial-temporal congestion density heatmap</div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#64748b]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#1a1f2e] border border-[#252d3d]" /> Low</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#3b82f6]" /> Normal</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#f59e0b]" /> High</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#ef4444]" /> Critical</span>
                </div>
              </div>

              {/* Matrix Layout */}
              <div className="space-y-1.5 overflow-x-auto pb-2">
                {DAYS.map((day, dIdx) => (
                  <div key={day} className="flex items-center gap-1.5 text-[10px] font-mono">
                    <span className="w-7 text-[#64748b] shrink-0">{day}</span>
                    <div className="flex items-center gap-1 flex-1">
                      {HOURS.map((hour, hIdx) => {
                        const bg = generateHeatmapIntensity(dIdx, hIdx);
                        return (
                          <div
                            key={hour}
                            title={`${day} ${hour}`}
                            className={`h-4 flex-1 min-w-[10px] rounded-xs ${bg} transition-opacity hover:opacity-80`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 10 Origin-Destination Routes */}
            <div className="bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-4 h-[280px] flex flex-col">
              <div className="text-xs font-semibold text-[#f1f5f9] mb-1">
                Top 10 Origin-Destination Corridors
              </div>
              <div className="text-[11px] text-[#64748b] mb-2">Most frequent vehicle transit corridors</div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockTopRoutes.slice(0, 6)} layout="vertical">
                    <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis dataKey="route" type="category" stroke="#64748b" fontSize={9} width={130} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#141821', borderColor: '#252d3d', fontSize: '11px', borderRadius: '4px' }}
                    />
                    <Bar dataKey="trips" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Camera Performance Table */}
          <div className="bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#252d3d] mb-3">
              <div className="text-xs font-semibold text-[#f1f5f9]">
                Optical Sensor & Camera Node Performance
              </div>
              <div className="text-[11px] text-[#64748b] font-mono">
                8 Registered Hardware Nodes
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141821] text-[#64748b] border-b border-[#252d3d] font-mono">
                  <tr>
                    <th className="p-2.5">Camera ID</th>
                    <th className="p-2.5">Location</th>
                    <th className="p-2.5">Resolution</th>
                    <th className="p-2.5">Total Reads Today</th>
                    <th className="p-2.5">OCR Accuracy</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Last Seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252d3d] font-mono">
                  {mockCameras.map((cam) => (
                    <tr key={cam.id} className="hover:bg-[#141821]/50">
                      <td className="p-2.5 font-bold text-[#3b82f6]">{cam.id}</td>
                      <td className="p-2.5 text-[#f1f5f9]">{cam.name}</td>
                      <td className="p-2.5 text-[#64748b]">{cam.resolution}</td>
                      <td className="p-2.5 text-[#f1f5f9]">{cam.readsToday.toLocaleString()}</td>
                      <td className="p-2.5 text-[#22c55e] font-semibold">{cam.accuracy}%</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            cam.status === 'ACTIVE'
                              ? 'bg-[#22c55e]/20 text-[#22c55e]'
                              : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                          }`}
                        >
                          {cam.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-[#64748b]">{cam.lastSeen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
