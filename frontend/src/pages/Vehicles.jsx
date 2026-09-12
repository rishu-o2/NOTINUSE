import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { mockANPRRecords } from '../data/mockData';

export default function Vehicles() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const vehiclesList = mockANPRRecords.filter((v) =>
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-screen h-screen bg-[#0f1117] flex overflow-hidden select-none">
      <Sidebar />

      <div className="flex-1 ml-[220px] h-screen flex flex-col overflow-y-auto">
        <Topbar breadcrumb="Vehicles Inventory & Classification" />

        <div className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-base font-bold text-[#f1f5f9]">
                Vehicle Registry & Model Classification
              </h1>
              <p className="text-xs text-[#64748b] mt-0.5">
                AI automated vehicle categorization (Sedan, SUV, Bus, Two-Wheeler) and historical scans
              </p>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vehicle model / plate..."
              className="px-3 py-2 bg-[#1a1f2e] border border-[#252d3d] rounded text-xs text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] w-64"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {vehiclesList.map((v) => (
              <div
                key={v.id}
                className="bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-mono text-[#3b82f6]">{v.plate}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        v.status === 'Clear'
                          ? 'bg-[#166534] text-[#22c55e]'
                          : v.status === 'Blacklist'
                          ? 'bg-[#7f1d1d] text-[#ef4444]'
                          : 'bg-[#713f12] text-[#f59e0b]'
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#f1f5f9]">{v.vehicleType}</div>
                  <div className="text-[11px] text-[#64748b] mt-1 font-mono">Last Location: {v.location}</div>
                  <div className="text-[11px] text-[#64748b] font-mono">Recorded Speed: {v.speed} km/h</div>
                </div>

                <button
                  onClick={() => navigate('/trajectories')}
                  className="mt-4 w-full py-1.5 bg-[#141821] hover:bg-[#252d3d] border border-[#252d3d] text-xs text-[#f1f5f9] rounded transition-colors"
                >
                  View Route History →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
