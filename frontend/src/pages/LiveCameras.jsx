import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { mockCameras } from '../data/mockData';

// ─── Indian plate pool ─────────────────────────────────────────────────────────
const PLATE_POOL = [
  'DL08CX9901', 'MH12DE1433', 'UP32BT5521', 'KA03MN7842',
  'TN09AK3310', 'RJ14GH2205', 'GJ01AB8874', 'PB10XX1234',
  'HR26DA0001', 'WB20CD4432', 'MP09JK7761', 'BR01LM5543',
  'AP28ZZ9910', 'TS09EF6621', 'OD02PQ3388', 'CG04RS1199',
  'JH10UV8820', 'GA03WX5517', 'HP25YZ6643', 'UK07MN2298',
];

const randomPlate = () => PLATE_POOL[Math.floor(Math.random() * PLATE_POOL.length)];

// ─── How many real video files you have (reuse mod) ──────────────────────────
const AVAILABLE_VIDEOS = 8; // all 8 AIC2022 camera clips

const videoSrc = (camIndex) => {
  const fileNum = ((camIndex - 1) % AVAILABLE_VIDEOS) + 1;
  return `/videos/camera${fileNum}.mp4`;
};

// ─── Scanning line overlay (pure CSS animation via inline keyframes) ──────────
function ScanningOverlay() {
  return (
    <>
      <style>{`
        @keyframes scan {
          0%   { top: 0%; }
          100% { top: 100%; }
        }
        .scan-line {
          position: absolute;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(0, 212, 255, 0.05) 20%,
            rgba(0, 212, 255, 0.30) 50%,
            rgba(0, 212, 255, 0.05) 80%,
            transparent 100%
          );
          animation: scan 3s linear infinite;
          pointer-events: none;
          z-index: 10;
        }
        .scan-glow {
          position: absolute;
          left: 0;
          width: 100%;
          height: 8px;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(0, 212, 255, 0.03) 20%,
            rgba(0, 212, 255, 0.10) 50%,
            rgba(0, 212, 255, 0.03) 80%,
            transparent 100%
          );
          animation: scan 3s linear infinite;
          pointer-events: none;
          z-index: 9;
          filter: blur(2px);
        }
      `}</style>
      <div className="scan-line" />
      <div className="scan-glow" />
    </>
  );
}

// ─── Per-camera video card ─────────────────────────────────────────────────────
function CameraCard({ cam, index, onClick }) {
  const isOnline = cam.status === 'ACTIVE';
  const [lastPlate, setLastPlate] = useState(randomPlate());
  const [plateTs, setPlateTs]     = useState(new Date().toLocaleTimeString('en-IN', { hour12: false }));
  const videoRef = useRef(null);

  // Rotate plate every 2 s
  useEffect(() => {
    if (!isOnline) return;
    const id = setInterval(() => {
      setLastPlate(randomPlate());
      setPlateTs(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    }, 2000);
    return () => clearInterval(id);
  }, [isOnline]);

  return (
    <div
      onClick={() => onClick(cam)}
      className="bg-[#1a1f2e] border border-[#252d3d] hover:border-[#3b82f6] rounded-lg
                 overflow-hidden flex flex-col cursor-pointer transition-all duration-200"
    >
      {/* ── Card header ─────────────────────────────────────────── */}
      <div className="px-3 py-2 bg-[#141821] border-b border-[#252d3d] flex items-center justify-between">
        <div>
          <div className="font-bold text-xs text-[#f1f5f9] flex items-center gap-1.5">
            <span className="text-[#3b82f6]">{cam.code}</span>
            <span>{cam.name}</span>
          </div>
          <div className="text-[10px] text-[#64748b] font-mono">{cam.id}</div>
        </div>

        {isOnline ? (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#22c55e]/15 text-[#22c55e] text-[10px] font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            LIVE
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] text-[10px] font-mono font-semibold">
            OFFLINE
          </span>
        )}
      </div>

      {/* ── Video / Offline area ─────────────────────────────────── */}
      <div className="h-36 bg-[#0a0d14] relative overflow-hidden">

        {isOnline ? (
          <>
            {/* Real video */}
            <video
              ref={videoRef}
              src={videoSrc(index)}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />

            {/* Scanning line AI overlay */}
            <ScanningOverlay />

            {/* REC badge top-left */}
            <div className="absolute top-1.5 left-2 z-20 flex items-center gap-1 text-[#22c55e] text-[9px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
              REC · {cam.resolution ?? '1080P'}
            </div>

            {/* Camera code watermark top-right */}
            <div className="absolute top-1.5 right-2 z-20 text-[9px] font-mono text-white/40">
              {cam.code}
            </div>
          </>
        ) : (
          /* OFFLINE — dark screen */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0a0d14]">
            <svg className="w-6 h-6 text-[#334155]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
            <span className="text-[10px] font-mono text-[#334155] tracking-wider">SIGNAL LOST — HEARTBEAT TIMEOUT</span>
            <span className="text-[9px] font-mono text-[#1e2840]">{cam.id} · DISCONNECTED</span>
          </div>
        )}
      </div>

      {/* ── Bottom telemetry bar ─────────────────────────────────── */}
      <div className="px-2.5 py-2 bg-[#141821] border-t border-[#252d3d] flex items-center justify-between text-[11px] font-mono text-[#64748b]">
        <div className="flex items-center gap-1.5">
          <span className="text-[#64748b]">Last Read:</span>
          <span className="text-[#f1f5f9] font-bold tracking-wide">
            {isOnline ? lastPlate : 'N/A'}
          </span>
        </div>
        <span>{isOnline ? plateTs : cam.lastSeen}</span>
      </div>
    </div>
  );
}

// ─── Expanded Modal ────────────────────────────────────────────────────────────
function CameraModal({ cam, index, onClose }) {
  const isOnline = cam.status === 'ACTIVE';
  const [lastPlate, setLastPlate] = useState(randomPlate());
  const [plateTs, setPlateTs]     = useState(new Date().toLocaleTimeString('en-IN', { hour12: false }));

  useEffect(() => {
    if (!isOnline) return;
    const id = setInterval(() => {
      setLastPlate(randomPlate());
      setPlateTs(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    }, 2000);
    return () => clearInterval(id);
  }, [isOnline]);

  // close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1f2e] border border-[#252d3d] rounded-lg max-w-3xl w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="px-4 py-3 bg-[#141821] border-b border-[#252d3d] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#f1f5f9] flex items-center gap-2">
              <span className="text-[#3b82f6]">{cam.code}</span>
              {cam.name}
              {isOnline && (
                <span className="flex items-center gap-1 text-[#22c55e] text-[10px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  LIVE
                </span>
              )}
            </h3>
            <p className="text-xs text-[#64748b] font-mono mt-0.5">
              {cam.id} · RTSP/H.264 · {cam.resolution ?? '1920×1080'} · Lat: {cam.lat?.toFixed(4)}, Lng: {cam.lng?.toFixed(4)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#141821] hover:bg-[#252d3d] border border-[#252d3d] text-xs text-[#f1f5f9] rounded transition-colors"
          >
            Close ✕
          </button>
        </div>

        {/* Large video */}
        <div className="relative bg-[#0a0d14] overflow-hidden" style={{ height: '420px' }}>
          {isOnline ? (
            <>
              <video
                src={videoSrc(index)}
                autoPlay
                loop
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <ScanningOverlay />
              {/* REC watermark */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 text-[#22c55e] text-[10px] font-mono bg-black/40 px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
                REC · {cam.resolution ?? '1080P'} · 30FPS
              </div>
              {/* Last plate overlay bottom */}
              <div className="absolute bottom-3 left-3 z-20 font-mono text-xs text-white bg-black/60 px-2 py-1 rounded flex items-center gap-2">
                <span className="text-[#64748b]">ANPR:</span>
                <span className="text-[#f1f5f9] font-bold tracking-widest">{lastPlate}</span>
                <span className="text-[#64748b]">{plateTs}</span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <svg className="w-10 h-10 text-[#1e2840]" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
              <p className="text-sm font-mono text-[#334155] tracking-widest">SIGNAL LOST — HEARTBEAT TIMEOUT</p>
              <p className="text-xs font-mono text-[#1e2840]">Last seen: {cam.lastSeen}</p>
            </div>
          )}
        </div>

        {/* Stats strip */}
        <div className="px-4 py-3 grid grid-cols-4 gap-4 bg-[#141821] border-t border-[#252d3d] text-xs font-mono">
          <div>
            <div className="text-[10px] text-[#64748b] mb-0.5">STATUS</div>
            <div className={`font-bold ${isOnline ? 'text-[#22c55e]' : 'text-[#f59e0b]'}`}>{cam.status}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#64748b] mb-0.5">ACCURACY</div>
            <div className="text-[#f1f5f9] font-bold">{cam.accuracy}%</div>
          </div>
          <div>
            <div className="text-[10px] text-[#64748b] mb-0.5">TODAY'S SCANS</div>
            <div className="text-[#3b82f6] font-bold">{cam.readsToday?.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#64748b] mb-0.5">LATENCY</div>
            <div className="text-[#f1f5f9] font-bold">18 ms</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LiveCameras() {
  const [selectedCam, setSelectedCam]   = useState(null);
  const [selectedIdx, setSelectedIdx]   = useState(null);

  const handleOpen  = useCallback((cam, idx) => { setSelectedCam(cam); setSelectedIdx(idx + 1); }, []);
  const handleClose = useCallback(() => { setSelectedCam(null); setSelectedIdx(null); }, []);

  const onlineCount = mockCameras.filter((c) => c.status === 'ACTIVE').length;

  return (
    <div className="w-screen h-screen bg-[#0f1117] flex overflow-hidden select-none">
      <Sidebar />

      <div className="flex-1 ml-[220px] h-screen flex flex-col overflow-y-auto">
        <Topbar breadcrumb="Live Camera Matrix" />

        <div className="p-6 space-y-4">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-[#f1f5f9]">
                City-Wide Surveillance Feeds (2×4 Matrix)
              </h1>
              <p className="text-xs text-[#64748b] mt-0.5">
                Real-time optical feed monitoring with embedded ANPR telemetry
              </p>
            </div>
            <div className="text-xs font-mono text-[#64748b]">
              Grid Status:{' '}
              <span className="text-[#22c55e] font-semibold">{onlineCount} Online</span>
              {' '}/ {mockCameras.length - onlineCount} Disconnected
            </div>
          </div>

          {/* 2×4 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockCameras.map((cam, idx) => (
              <CameraCard
                key={cam.id}
                cam={cam}
                index={idx + 1}
                onClick={(c) => handleOpen(c, idx)}
              />
            ))}
          </div>

          {/* Placeholder note if no videos */}
          <div className="border border-[#252d3d] rounded-lg bg-[#1a1f2e] px-4 py-3 flex items-start gap-3">
            <svg className="w-4 h-4 text-[#3b82f6] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <div className="text-xs font-mono text-[#64748b] leading-relaxed">
              <span className="text-[#f1f5f9]">Video files expected at:</span>{' '}
              <code className="bg-[#141821] px-1.5 py-0.5 rounded text-[#3b82f6]">public/videos/camera1.mp4</code>
              {' '}…{' '}
              <code className="bg-[#141821] px-1.5 py-0.5 rounded text-[#3b82f6]">camera8.mp4</code>
              <span className="block mt-1 text-[#64748b]">
                Currently using{' '}
                <code className="bg-[#141821] px-1 rounded text-[#f59e0b]">{AVAILABLE_VIDEOS}</code>{' '}
                video file(s) in rotation. Drop your real .mp4 files and set{' '}
                <code className="bg-[#141821] px-1 rounded text-[#22c55e]">AVAILABLE_VIDEOS = 8</code>.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedCam && (
        <CameraModal cam={selectedCam} index={selectedIdx} onClose={handleClose} />
      )}
    </div>
  );
}
