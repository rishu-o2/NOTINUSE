import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { mockANPRRecords, mockCameras } from '../data/mockData';

export default function ANPR() {
  const navigate = useNavigate();
  const [searchPlate, setSearchPlate] = useState('');
  const [cameraFilter, setCameraFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('timestamp');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filtering
  const filteredRecords = mockANPRRecords.filter((rec) => {
    const matchPlate = rec.plate.toLowerCase().includes(searchPlate.toLowerCase());
    const matchCam = cameraFilter === 'ALL' || rec.camera === cameraFilter;
    const matchStatus = statusFilter === 'ALL' || rec.status === statusFilter;
    return matchPlate && matchCam && matchStatus;
  });

  // Sorting
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let v1 = a[sortField];
    let v2 = b[sortField];
    if (typeof v1 === 'string') {
      v1 = v1.toLowerCase();
      v2 = v2.toLowerCase();
    }
    if (v1 < v2) return sortAsc ? -1 : 1;
    if (v1 > v2) return sortAsc ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage) || 1;
  const paginatedRecords = sortedRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExportCSV = () => {
    const headers = 'ID,Plate,Camera,Location,Timestamp,Speed,Status,VehicleType\n';
    const rows = sortedRecords
      .map((r) => `${r.id},${r.plate},${r.camera},${r.location},${r.timestamp},${r.speed},${r.status},${r.vehicleType}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ANPR_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="w-screen h-screen bg-[#0f1117] flex overflow-hidden select-none">
      <Sidebar />

      <div className="flex-1 ml-[220px] h-screen flex flex-col overflow-y-auto">
        <Topbar breadcrumb="ANPR Records Database" />

        <div className="p-6 space-y-4 flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-base font-bold text-[#f1f5f9]">
                Automated Number Plate Recognition (ANPR) Logs
              </h1>
              <p className="text-xs text-[#64748b] mt-0.5">
                Centralized registry of verified vehicle scans, radar velocities, and hotlist alerts
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-[#1a1f2e] hover:bg-[#252d3d] border border-[#252d3d] text-xs font-semibold text-[#f1f5f9] rounded transition-colors flex items-center gap-1.5 self-start md:self-auto"
            >
              <span>📥</span> Export CSV Log
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-3.5 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {/* Search Input */}
            <div>
              <label className="block text-[10px] text-[#64748b] font-mono mb-1">SEARCH PLATE</label>
              <input
                type="text"
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value)}
                placeholder="Type plate number..."
                className="w-full px-3 py-1.5 bg-[#141821] border border-[#252d3d] rounded text-[#f1f5f9] font-mono focus:outline-none focus:border-[#3b82f6]"
              />
            </div>

            {/* Camera Filter */}
            <div>
              <label className="block text-[10px] text-[#64748b] font-mono mb-1">CAMERA NODE</label>
              <select
                value={cameraFilter}
                onChange={(e) => setCameraFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#141821] border border-[#252d3d] rounded text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] cursor-pointer"
              >
                <option value="ALL">All Cameras (8 Nodes)</option>
                {mockCameras.map((c) => (
                  <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[10px] text-[#64748b] font-mono mb-1">SURVEILLANCE STATUS</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#141821] border border-[#252d3d] rounded text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Clear">Clear</option>
                <option value="Blacklist">Blacklist (Hotlist)</option>
                <option value="Speeding">Speeding Violation</option>
              </select>
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-[10px] text-[#64748b] font-mono mb-1">DATE FILTER</label>
              <input
                type="date"
                defaultValue="2026-09-12"
                className="w-full px-3 py-1.5 bg-[#141821] border border-[#252d3d] rounded text-[#64748b] focus:outline-none focus:border-[#3b82f6]"
              />
            </div>
          </div>

          {/* Main Table */}
          <div className="bg-[#1a1f2e] border border-[#252d3d] rounded-lg flex-1 flex flex-col justify-between overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141821] text-[#64748b] border-b border-[#252d3d] font-mono">
                  <tr>
                    <th className="p-3 cursor-pointer hover:text-[#f1f5f9]" onClick={() => handleSort('plate')}>
                      Plate Number {sortField === 'plate' ? (sortAsc ? '▲' : '▼') : ''}
                    </th>
                    <th className="p-3">Vehicle Details</th>
                    <th className="p-3 cursor-pointer hover:text-[#f1f5f9]" onClick={() => handleSort('camera')}>
                      Camera Node
                    </th>
                    <th className="p-3">Corridor Location</th>
                    <th className="p-3 cursor-pointer hover:text-[#f1f5f9]" onClick={() => handleSort('timestamp')}>
                      Timestamp {sortField === 'timestamp' ? (sortAsc ? '▲' : '▼') : ''}
                    </th>
                    <th className="p-3 cursor-pointer hover:text-[#f1f5f9]" onClick={() => handleSort('speed')}>
                      Speed {sortField === 'speed' ? (sortAsc ? '▲' : '▼') : ''}
                    </th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252d3d] font-mono">
                  {paginatedRecords.length > 0 ? (
                    paginatedRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-[#141821]/60">
                        <td
                          onClick={() => navigate('/trajectories')}
                          className="p-3 font-bold text-[#3b82f6] hover:underline cursor-pointer"
                        >
                          {r.plate}
                        </td>
                        <td className="p-3 text-[#f1f5f9]">{r.vehicleType}</td>
                        <td className="p-3 text-[#64748b]">{r.camera}</td>
                        <td className="p-3 text-[#f1f5f9]">{r.location}</td>
                        <td className="p-3 text-[#64748b]">{r.timestamp}</td>
                        <td className="p-3 font-semibold text-[#f1f5f9]">{r.speed} km/h</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'Clear'
                                ? 'bg-[#166534] text-[#22c55e]'
                                : r.status === 'Blacklist'
                                ? 'bg-[#7f1d1d] text-[#ef4444]'
                                : 'bg-[#713f12] text-[#f59e0b]'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => navigate('/trajectories')}
                            className="px-2.5 py-1 bg-[#141821] hover:bg-[#252d3d] border border-[#252d3d] text-[11px] text-[#3b82f6] rounded font-sans transition-colors"
                          >
                            Track Route
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#64748b]">
                        No matching ANPR logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-3 bg-[#141821] border-t border-[#252d3d] flex items-center justify-between text-xs text-[#64748b] font-mono">
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} -{' '}
                {Math.min(currentPage * itemsPerPage, sortedRecords.length)} of {sortedRecords.length} records
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 bg-[#1a1f2e] border border-[#252d3d] rounded hover:bg-[#252d3d] disabled:opacity-30"
                >
                  Previous
                </button>
                <span className="px-2 text-[#f1f5f9]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 bg-[#1a1f2e] border border-[#252d3d] rounded hover:bg-[#252d3d] disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
