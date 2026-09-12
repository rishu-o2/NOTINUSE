import React, { useState, useEffect } from 'react';

export default function Topbar({ breadcrumb = 'Dashboard' }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toTimeString().split(' ')[0] + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-[#141821] border-b border-[#252d3d] px-6 flex items-center justify-between select-none shrink-0">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[#64748b]">City Traffic Command</span>
        <span className="text-[#334155]">/</span>
        <span className="text-[#f1f5f9] font-medium">{breadcrumb}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 text-xs">
        {/* Live Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#1a1f2e] border border-[#252d3d]">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[#22c55e] font-medium">Live Feed</span>
        </div>

        {/* Camera Count */}
        <div className="flex items-center gap-1.5 text-[#64748b]">
          <span>Cameras:</span>
          <span className="text-[#f1f5f9] font-mono font-medium">7/8 Online</span>
        </div>

        {/* Time */}
        <div className="font-mono text-[#64748b] border-l border-[#252d3d] pl-4">
          {time || '14:50:00 IST'}
        </div>
      </div>
    </header>
  );
}
