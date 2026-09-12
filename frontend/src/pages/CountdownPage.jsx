import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BOOT_LOGS = [
  { prefix: '[OK]', text: 'Initializing Traffic Command Center...', color: 'text-[#22c55e]' },
  { prefix: '[OK]', text: 'Connecting to ANPR Camera Network (8 nodes)...', color: 'text-[#22c55e]' },
  { prefix: '[OK]', text: 'Loading YOLOv8 Detection Engine...', color: 'text-[#22c55e]' },
  { prefix: '[OK]', text: 'Establishing Database Connection...', color: 'text-[#22c55e]' },
  { prefix: '[READY]', text: 'System Online — 8 cameras active', color: 'text-[#3b82f6]' }
];

export default function CountdownPage() {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setVisibleCount(step);
      setProgress(Math.round((step / BOOT_LOGS.length) * 100));

      if (step >= BOOT_LOGS.length) {
        clearInterval(interval);
        setTimeout(() => {
          navigate('/login');
        }, 500);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="w-screen h-screen bg-[#0f1117] flex flex-col justify-between p-8 font-mono select-none">
      {/* Top Left Header */}
      <div className="text-xs text-[#64748b]">
        BEL · SIH 2026
      </div>

      {/* Center Terminal Box */}
      <div className="max-w-xl w-full mx-auto bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-6 shadow-none">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#252d3d] text-xs text-[#64748b]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/60" />
          </div>
          <div>boot-sequence.sh</div>
        </div>

        {/* Console Logs */}
        <div className="space-y-2 text-xs min-h-[140px]">
          {BOOT_LOGS.slice(0, visibleCount).map((log, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className={`font-bold ${log.color}`}>{log.prefix}</span>
              <span className="text-[#f1f5f9]">{log.text}</span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-4 border-t border-[#252d3d]">
          <div className="flex items-center justify-between text-[11px] text-[#64748b] mb-1.5">
            <span>System Boot Status</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#141821] rounded-full overflow-hidden border border-[#252d3d]">
            <div
              className="h-full bg-[#3b82f6] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="text-center text-[11px] text-[#334155]">
        Urban Traffic Analytics System · Version 2.4.0-Production
      </div>
    </div>
  );
}
