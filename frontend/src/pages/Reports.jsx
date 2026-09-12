import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const MOCK_REPORTS = [
  { id: 'REP-001', name: 'Daily Urban Traffic & Congestion Digest', date: '2026-09-12', size: '2.4 MB', type: 'PDF' },
  { id: 'REP-002', name: 'ANPR Hotlist Surveillance & Blacklist Hits', date: '2026-09-12', size: '1.1 MB', type: 'PDF' },
  { id: 'REP-003', name: 'Peak Hour Corridor Velocity Analysis', date: '2026-09-11', size: '4.8 MB', type: 'CSV' },
  { id: 'REP-004', name: 'Weekly Optical Camera Reliability & Downtime Audit', date: '2026-09-10', size: '3.2 MB', type: 'PDF' },
  { id: 'REP-005', name: 'Speed Enforcement Violation Notice Export', date: '2026-09-09', size: '5.6 MB', type: 'ZIP' }
];

export default function Reports() {
  return (
    <div className="w-screen h-screen bg-[#0f1117] flex overflow-hidden select-none">
      <Sidebar />

      <div className="flex-1 ml-[220px] h-screen flex flex-col overflow-y-auto">
        <Topbar breadcrumb="Intelligence Reports & Audits" />

        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-base font-bold text-[#f1f5f9]">
                Intelligence & Forensic Audit Reports
              </h1>
              <p className="text-xs text-[#64748b] mt-0.5">
                Exportable historical dossiers for municipal authorities, police surveillance, and traffic planning
              </p>
            </div>
            <button
              onClick={() => alert('Generating customized automated report for NCR grid...')}
              className="px-4 py-2 bg-[#3b82f6] hover:bg-blue-600 text-white rounded text-xs font-semibold transition-colors"
            >
              + Generate Custom Report
            </button>
          </div>

          <div className="bg-[#1a1f2e] border border-[#252d3d] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141821] text-[#64748b] border-b border-[#252d3d] font-mono">
                <tr>
                  <th className="p-3">Report Identifier</th>
                  <th className="p-3">Document Title</th>
                  <th className="p-3">Generated Date</th>
                  <th className="p-3">Format</th>
                  <th className="p-3">File Size</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252d3d] font-mono">
                {MOCK_REPORTS.map((r) => (
                  <tr key={r.id} className="hover:bg-[#141821]/50">
                    <td className="p-3 font-bold text-[#3b82f6]">{r.id}</td>
                    <td className="p-3 font-sans font-medium text-[#f1f5f9]">{r.name}</td>
                    <td className="p-3 text-[#64748b]">{r.date}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-[#141821] border border-[#252d3d] text-[10px] text-[#f1f5f9]">
                        {r.type}
                      </span>
                    </td>
                    <td className="p-3 text-[#64748b]">{r.size}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => alert(`Downloading ${r.name}...`)}
                        className="px-3 py-1 bg-[#141821] hover:bg-[#252d3d] border border-[#252d3d] text-[#3b82f6] rounded font-sans text-xs"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
