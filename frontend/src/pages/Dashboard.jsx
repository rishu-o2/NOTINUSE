import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import CityScene from '../components/CityScene';

export default function Dashboard() {
  const [vehiclesTracked, setVehiclesTracked] = useState(1284);
  const [avgSpeed, setAvgSpeed] = useState(32);
  const [activeTrajectories, setActiveTrajectories] = useState(327);
  const [ocrAccuracy, setOcrAccuracy] = useState(92.4);

  // Live statistical jitter every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setVehiclesTracked((prev) => prev + Math.floor(Math.random() * 9) - 4);
      setAvgSpeed((prev) => Math.max(20, Math.min(48, prev + (Math.random() > 0.5 ? 1 : -1))));
      setActiveTrajectories((prev) => prev + Math.floor(Math.random() * 5) - 2);
      setOcrAccuracy((prev) => +(91.5 + Math.random() * 2.2).toFixed(1));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050a18] flex select-none">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar />

      {/* Main 3D Simulation & HUD Viewport */}
      <main className="relative flex-1 h-screen ml-[210px] overflow-hidden">
        {/* Fullscreen 3D City Background */}
        <CityScene opacity={0.9} interactive={true} />

        {/* TOP BAR (Floating) */}
        <div className="absolute top-5 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3 bg-white/[0.04] backdrop-blur-[16px] px-5 py-2.5 rounded-2xl border border-[#00d4ff]/20 shadow-[0_0_20px_rgba(0,212,255,0.08)] pointer-events-auto">
            <h1 className="text-white font-bold text-base tracking-wide flex items-center gap-2">
              <span className="text-[#00d4ff]">⚡</span> Live Traffic Overview
            </h1>
            <div className="h-4 w-[1px] bg-white/20" />
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>8 Cameras Live</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/[0.04] backdrop-blur-[16px] px-4 py-2 rounded-2xl border border-[#00d4ff]/20 shadow-[0_0_20px_rgba(0,212,255,0.08)] pointer-events-auto">
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-mono text-[#00d4ff] uppercase tracking-wider">
                CLEARANCE LEVEL
              </span>
              <span className="text-xs font-bold text-white">COMMAND ADMIN</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00d4ff] to-blue-600 flex items-center justify-center font-bold text-xs text-[#050a18]">
              🛡️
            </div>
          </div>
        </div>

        {/* LEFT SIDE: Hero Stat Card (Floating vertically centered) */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-[240px] space-y-4 pointer-events-auto animate-fade-in">
          {/* Main Large Hero Stat */}
          <div className="p-6 rounded-[20px] bg-white/[0.04] backdrop-blur-[16px] border border-[#00d4ff]/20 shadow-[0_0_40px_rgba(0,212,255,0.12)]">
            <div className="text-[11px] font-mono uppercase tracking-widest text-gray-300">
              VEHICLES TRACKED LIVE
            </div>
            <div className="text-5xl font-black text-[#00d4ff] text-glow mt-2 tracking-tight">
              {vehiclesTracked.toLocaleString()}
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
              <span>▲ +4.2%</span>
              <span className="text-gray-400">vs last hour</span>
            </div>
          </div>

          {/* Average Speed Stat */}
          <div className="p-4 rounded-[16px] bg-white/[0.04] backdrop-blur-[16px] border border-[#00d4ff]/20 shadow-[0_0_25px_rgba(0,212,255,0.06)] flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                AVG CORRIDOR SPEED
              </div>
              <div className="text-2xl font-bold text-white mt-0.5">
                {avgSpeed} <span className="text-sm font-normal text-[#00d4ff]">km/h</span>
              </div>
            </div>
            <div className="text-2xl">🚗</div>
          </div>
        </div>

        {/* RIGHT SIDE: Stacked Cards (Floating right) */}
        <div className="absolute right-6 top-24 bottom-24 z-20 w-[300px] flex flex-col justify-center space-y-3 pointer-events-auto">
          {/* Card 1: Recent Alerts */}
          <div className="p-4 rounded-[16px] bg-white/[0.04] backdrop-blur-[16px] border border-[#00d4ff]/20 shadow-[0_0_25px_rgba(0,212,255,0.06)]">
            <div className="text-xs font-bold text-white flex items-center justify-between mb-2.5">
              <span>🚨 Recent Alerts</span>
              <span className="text-[10px] font-mono text-[#00d4ff]">LIVE STREAM</span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="truncate">C2 Speeding: DL 01 AB 4492 (84 km/h)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="truncate">C5 Wrong Way Lane Detected</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="truncate">C7 High Volume Congestion Node</span>
              </div>
            </div>
          </div>

          {/* Card 2: Top Congested Roads */}
          <div className="p-4 rounded-[16px] bg-white/[0.04] backdrop-blur-[16px] border border-[#00d4ff]/20 shadow-[0_0_25px_rgba(0,212,255,0.06)]">
            <div className="text-xs font-bold text-white mb-3">
              🚦 Top Congested Roads
            </div>
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-gray-300 mb-1">
                  <span>C2 → C3 (Ring Rd)</span>
                  <span className="text-red-400 font-bold">87%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '87%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-mono text-gray-300 mb-1">
                  <span>C3 → C5 (Central Spine)</span>
                  <span className="text-amber-400 font-bold">65%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-mono text-gray-300 mb-1">
                  <span>C1 → C2 (Northern Cross)</span>
                  <span className="text-cyan-400 font-bold">48%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00d4ff] rounded-full" style={{ width: '48%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Blacklist Alert */}
          <div className="p-4 rounded-[16px] bg-red-950/30 backdrop-blur-[16px] border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.18)] animate-pulse">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 tracking-wide uppercase flex items-center gap-1.5">
                <span>⚠️</span> Blacklist Alert
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/30 text-red-300">
                HOTLIST
              </span>
            </div>
            <div className="mt-2 text-white font-mono font-bold text-sm">
              DL 08 CX 9901
            </div>
            <div className="text-[11px] font-mono text-red-300 mt-0.5">
              Flagged: Suspected Vehicle · Spotted at C4
            </div>
          </div>
        </div>

        {/* BOTTOM (Floating Horizontal Row of Stat Pills) */}
        <div className="absolute bottom-5 left-6 right-6 z-20 flex items-center justify-center gap-4 pointer-events-none">
          <div className="flex items-center gap-6 bg-white/[0.04] backdrop-blur-[16px] px-6 py-2.5 rounded-full border border-[#00d4ff]/20 shadow-[0_0_25px_rgba(0,212,255,0.08)] pointer-events-auto text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 uppercase">Active Trajectories:</span>
              <span className="text-[#00d4ff] font-bold">{activeTrajectories}</span>
            </div>
            <div className="h-3 w-[1px] bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-gray-400 uppercase">Congestion:</span>
              <span className="text-amber-400 font-bold">HIGH (Sector 4)</span>
            </div>
            <div className="h-3 w-[1px] bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-gray-400 uppercase">OCR Accuracy:</span>
              <span className="text-emerald-400 font-bold">{ocrAccuracy}%</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
