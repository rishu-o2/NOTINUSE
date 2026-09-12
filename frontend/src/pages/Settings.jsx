import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function Settings() {
  const [yoloModel, setYoloModel] = useState('YOLOv8x-Custom-ANPR');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85);
  const [speedLimit, setSpeedLimit] = useState(60);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="w-screen h-screen bg-[#0f1117] flex overflow-hidden select-none">
      <Sidebar />

      <div className="flex-1 ml-[220px] h-screen flex flex-col overflow-y-auto">
        <Topbar breadcrumb="System & Hardware Configuration" />

        <div className="p-6 space-y-6 max-w-4xl">
          <div>
            <h1 className="text-base font-bold text-[#f1f5f9]">
              Surveillance Platform Settings
            </h1>
            <p className="text-xs text-[#64748b] mt-0.5">
              Tune AI detection confidence, radar alert triggers, and optical streaming servers
            </p>
          </div>

          {/* Configuration Card 1: AI Model */}
          <div className="bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-5 space-y-4">
            <h3 className="text-xs font-semibold text-[#f1f5f9] border-b border-[#252d3d] pb-2">
              Vision Detection Engine
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#64748b] font-mono mb-1.5">OBJECT DETECTION ENGINE</label>
                <select
                  value={yoloModel}
                  onChange={(e) => setYoloModel(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141821] border border-[#252d3d] rounded text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6]"
                >
                  <option value="YOLOv8x-Custom-ANPR">YOLOv8x (High Precision / CUDA)</option>
                  <option value="YOLOv8m-Fast">YOLOv8m (Balanced Latency)</option>
                  <option value="YOLOv8n-Edge">YOLOv8n (Edge Compute)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#64748b] font-mono mb-1.5">
                  OCR CONFIDENCE THRESHOLD ({confidenceThreshold * 100}%)
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-[#3b82f6]"
                />
              </div>
            </div>
          </div>

          {/* Configuration Card 2: Alerts */}
          <div className="bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-5 space-y-4">
            <h3 className="text-xs font-semibold text-[#f1f5f9] border-b border-[#252d3d] pb-2">
              Automated Violation Alarms
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#64748b] font-mono mb-1.5">SPEEDING TRIGGER (KM/H)</label>
                <input
                  type="number"
                  value={speedLimit}
                  onChange={(e) => setSpeedLimit(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#141821] border border-[#252d3d] rounded text-[#f1f5f9] font-mono focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="autosave"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="w-4 h-4 accent-[#3b82f6]"
                />
                <label htmlFor="autosave" className="text-xs text-[#f1f5f9]">
                  Auto-flag plates matching NCR Crime Database hotlist
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => alert('Settings saved successfully!')}
              className="px-5 py-2 bg-[#3b82f6] hover:bg-blue-600 text-white rounded text-xs font-semibold transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
