import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { mockCameras } from '../data/mockData';

// Simulated CCTV Video Feed on Canvas (rectangles moving across road)
function CameraFeedCanvas({ isOnline = true, camCode = 'C1' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const width = (canvas.width = 320);
    const height = (canvas.height = 180);

    if (!isOnline) {
      // Offline noise / placeholder
      ctx.fillStyle = '#141821';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#64748b';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SIGNAL LOST — HEARTBEAT TIMEOUT', width / 2, height / 2);
      return;
    }

    const cars = [
      { x: 20, y: 70, w: 28, h: 14, speed: 1.8, color: '#f1f5f9' },
      { x: 120, y: 70, w: 32, h: 16, speed: 1.4, color: '#3b82f6' },
      { x: 240, y: 100, w: 26, h: 14, speed: -1.6, color: '#f59e0b' },
      { x: 80, y: 100, w: 35, h: 18, speed: -2.1, color: '#ef4444' }
    ];

    const render = () => {
      // Background Road
      ctx.fillStyle = '#121620';
      ctx.fillRect(0, 0, width, height);

      // Roadway
      ctx.fillStyle = '#1e2433';
      ctx.fillRect(0, 50, width, 80);

      // Center dashed line
      ctx.strokeStyle = '#f59e0b';
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 90);
      ctx.lineTo(width, 90);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Moving Vehicle Rectangles
      cars.forEach((car) => {
        car.x += car.speed;
        if (car.speed > 0 && car.x > width + 40) car.x = -40;
        if (car.speed < 0 && car.x < -40) car.x = width + 40;

        ctx.fillStyle = car.color;
        ctx.fillRect(car.x, car.y, car.w, car.h);

        // Simulated Headlights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        if (car.speed > 0) {
          ctx.fillRect(car.x + car.w, car.y + 2, 8, 4);
          ctx.fillRect(car.x + car.w, car.y + car.h - 6, 8, 4);
        } else {
          ctx.fillRect(car.x - 8, car.y + 2, 8, 4);
          ctx.fillRect(car.x - 8, car.y + car.h - 6, 8, 4);
        }
      });

      // Camera Watermark / Timestamp
      ctx.fillStyle = '#22c55e';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`REC ● [${camCode}] 1080P/30FPS`, 10, 20);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isOnline, camCode]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-cover cctv-scanline block"
    />
  );
}

export default function LiveCameras() {
  const [selectedCam, setSelectedCam] = useState(null);

  return (
    <div className="w-screen h-screen bg-[#0f1117] flex overflow-hidden select-none">
      <Sidebar />

      <div className="flex-1 ml-[220px] h-screen flex flex-col overflow-y-auto">
        <Topbar breadcrumb="Live Camera Matrix" />

        <div className="p-6 space-y-4">
          {/* Header */}
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
              Grid Status: <span className="text-[#22c55e] font-semibold">7 Online</span> / 1 Disconnected
            </div>
          </div>

          {/* 2x4 Grid of Camera Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockCameras.map((cam) => {
              const isOnline = cam.status === 'ACTIVE';
              return (
                <div
                  key={cam.id}
                  onClick={() => setSelectedCam(cam)}
                  className="bg-[#1a1f2e] border border-[#252d3d] hover:border-[#3b82f6] rounded-lg overflow-hidden flex flex-col cursor-pointer transition-all"
                >
                  {/* Card Header */}
                  <div className="p-3 bg-[#141821] border-b border-[#252d3d] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[#f1f5f9] flex items-center gap-1.5">
                        <span className="text-[#3b82f6]">{cam.code}</span>
                        <span>{cam.name}</span>
                      </div>
                      <div className="text-[10px] text-[#64748b] font-mono">{cam.id}</div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        isOnline
                          ? 'bg-[#22c55e]/20 text-[#22c55e]'
                          : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                      }`}
                    >
                      {isOnline ? 'LIVE' : 'OFFLINE'}
                    </span>
                  </div>

                  {/* Video Area (Canvas) */}
                  <div className="h-36 bg-[#141821] relative overflow-hidden">
                    <CameraFeedCanvas isOnline={isOnline} camCode={cam.code} />
                  </div>

                  {/* Bottom Telemetry Bar */}
                  <div className="p-2.5 bg-[#141821] border-t border-[#252d3d] flex items-center justify-between text-[11px] font-mono text-[#64748b]">
                    <div className="flex items-center gap-1.5">
                      <span>Last Read:</span>
                      <span className="text-[#f1f5f9] font-bold">
                        {isOnline ? 'DL 01 AB 1234' : 'N/A'}
                      </span>
                    </div>
                    <span>{cam.lastSeen}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expanded Modal View */}
      {selectedCam && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="bg-[#1a1f2e] border border-[#252d3d] rounded-lg max-w-3xl w-full overflow-hidden flex flex-col">
            <div className="p-4 bg-[#141821] border-b border-[#252d3d] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#f1f5f9] flex items-center gap-2">
                  <span>📹</span> {selectedCam.id} — {selectedCam.name}
                </h3>
                <p className="text-xs text-[#64748b] font-mono mt-0.5">
                  Stream Protocol: RTSP / H.264 · Resolution: {selectedCam.resolution}
                </p>
              </div>
              <button
                onClick={() => setSelectedCam(null)}
                className="px-3 py-1 bg-[#141821] hover:bg-[#252d3d] border border-[#252d3d] text-xs text-[#f1f5f9] rounded"
              >
                Close ✕
              </button>
            </div>

            <div className="h-96 bg-[#141821] relative">
              <CameraFeedCanvas isOnline={selectedCam.status === 'ACTIVE'} camCode={selectedCam.code} />
            </div>

            <div className="p-4 grid grid-cols-4 gap-3 bg-[#141821] border-t border-[#252d3d] text-xs font-mono">
              <div>
                <div className="text-[10px] text-[#64748b]">STATUS</div>
                <div className="text-[#22c55e] font-bold mt-0.5">{selectedCam.status}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#64748b]">ACCURACY</div>
                <div className="text-[#f1f5f9] font-bold mt-0.5">{selectedCam.accuracy}%</div>
              </div>
              <div>
                <div className="text-[10px] text-[#64748b]">TODAY'S SCANS</div>
                <div className="text-[#3b82f6] font-bold mt-0.5">{selectedCam.readsToday.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#64748b]">LATENCY</div>
                <div className="text-[#f1f5f9] font-bold mt-0.5">18 ms</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
