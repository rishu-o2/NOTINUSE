import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { mockAlerts } from '../data/mockData';

export default function Alerts() {
  const [alertsList, setAlertsList] = useState(mockAlerts);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const handleResolve = (id) => {
    setAlertsList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Resolved' } : a))
    );
  };

  const activeAlerts = alertsList.filter((a) => a.status === 'Active' || a.status === 'Investigating');
  const filteredHistory = alertsList.filter((a) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'Resolved') return a.status === 'Resolved';
    return a.severity.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <div className="w-screen h-screen bg-[#0f1117] flex overflow-hidden select-none">
      <Sidebar />

      <div className="flex-1 ml-[220px] h-screen flex flex-col overflow-y-auto">
        <Topbar breadcrumb="Security & Traffic Alerts" />

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-[#f1f5f9]">
                Live Incident & Anomaly Alert Monitor
              </h1>
              <p className="text-xs text-[#64748b] mt-0.5">
                Automated threshold alarms for vehicle hotlists, radar speeding, and corridor gridlocks
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
              <span className="text-[#ef4444] font-bold">{activeAlerts.length} Unresolved Incidents</span>
            </div>
          </div>

          {/* TOP SECTION: Active Alerts Cards */}
          <div>
            <div className="text-xs font-semibold text-[#64748b] font-mono uppercase mb-3">
              ACTIVE REAL-TIME ALERTS
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAlerts.map((alert) => {
                const isCritical = alert.severity === 'critical';
                const isWarning = alert.severity === 'warning';

                return (
                  <div
                    key={alert.id}
                    className={`p-4 bg-[#1a1f2e] border ${
                      isCritical
                        ? 'border-[#ef4444] animate-pulse'
                        : isWarning
                        ? 'border-[#f59e0b]'
                        : 'border-[#3b82f6]'
                    } rounded-lg flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            isCritical
                              ? 'bg-[#ef4444]/20 text-[#ef4444]'
                              : isWarning
                              ? 'bg-[#f59e0b]/20 text-[#f59e0b]'
                              : 'bg-[#3b82f6]/20 text-[#3b82f6]'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-[11px] font-mono text-[#64748b]">{alert.time}</span>
                      </div>

                      <div className="font-bold text-xs text-[#f1f5f9] mb-1">
                        {alert.type}
                      </div>
                      <div className="text-xs text-[#64748b] leading-relaxed mb-3">
                        {alert.message}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#252d3d] mt-2">
                      <span className="text-[11px] font-mono text-[#3b82f6]">{alert.camera}</span>
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="px-3 py-1 bg-[#141821] hover:bg-[#22c55e]/20 hover:text-[#22c55e] border border-[#252d3d] text-xs font-medium text-[#f1f5f9] rounded transition-colors"
                      >
                        Resolve Alert
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BOTTOM SECTION: Alert History Table */}
          <div className="bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#252d3d] mb-3">
              <div className="text-xs font-semibold text-[#f1f5f9]">
                Historical Incident Logs
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#141821] p-1 rounded border border-[#252d3d] text-xs font-mono">
                {['ALL', 'Critical', 'Warning', 'Info', 'Resolved'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1 rounded transition-colors ${
                      activeFilter === filter
                        ? 'bg-[#1a1f2e] text-[#f1f5f9] font-bold border border-[#252d3d]'
                        : 'text-[#64748b] hover:text-[#f1f5f9]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141821] text-[#64748b] border-b border-[#252d3d] font-mono">
                  <tr>
                    <th className="p-2.5">Severity</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Description</th>
                    <th className="p-2.5">Camera</th>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252d3d] font-mono">
                  {filteredHistory.map((a) => (
                    <tr key={a.id} className="hover:bg-[#141821]/50">
                      <td className="p-2.5 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                            a.severity === 'critical'
                              ? 'text-[#ef4444]'
                              : a.severity === 'warning'
                              ? 'text-[#f59e0b]'
                              : a.severity === 'resolved'
                              ? 'text-[#64748b]'
                              : 'text-[#3b82f6]'
                          }`}
                        >
                          {a.severity}
                        </span>
                      </td>
                      <td className="p-2.5 text-[#f1f5f9]">{a.type}</td>
                      <td className="p-2.5 text-[#64748b]">{a.message}</td>
                      <td className="p-2.5 text-[#3b82f6]">{a.camera}</td>
                      <td className="p-2.5 text-[#64748b]">{a.time}</td>
                      <td className="p-2.5 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            a.status === 'Active'
                              ? 'bg-[#ef4444]/20 text-[#ef4444]'
                              : a.status === 'Investigating'
                              ? 'bg-[#f59e0b]/20 text-[#f59e0b]'
                              : 'bg-[#22c55e]/20 text-[#22c55e]'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
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
