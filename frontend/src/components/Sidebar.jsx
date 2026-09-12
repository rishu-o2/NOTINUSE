import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const MENU_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  { name: 'Live Cameras', path: '/cameras', icon: '📹' },
  { name: 'Vehicles', path: '/vehicles', icon: '🚗' },
  { name: 'ANPR Records', path: '/anpr', icon: '🔍' },
  { name: 'Trajectories', path: '/trajectories', icon: '📍' },
  { name: 'Analytics', path: '/analytics', icon: '📈' },
  { name: 'Alerts', path: '/alerts', icon: '🚨' },
  { name: 'Reports', path: '/reports', icon: '📑' },
  { name: 'Settings', path: '/settings', icon: '⚙️' }
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-[210px] bg-[#0a0f1e]/95 backdrop-blur-xl border-r border-[#00d4ff]/15 z-40 flex flex-col justify-between select-none">
      {/* Top Header / Logo */}
      <div>
        <div className="p-4 border-b border-white/[0.08] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00d4ff]/30 to-[#004488]/50 border border-[#00d4ff]/40 flex items-center justify-center text-lg shadow-[0_0_12px_rgba(0,212,255,0.3)]">
            📡
          </div>
          <div>
            <div className="font-bold text-white text-xs tracking-tight leading-tight">
              Traffic Command
            </div>
            <div className="text-[10px] font-mono text-[#00d4ff] tracking-wider uppercase">
              BEL · SIH 2026
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-2.5 space-y-1 mt-2">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#00d4ff]/15 text-[#00d4ff] border-l-4 border-[#00d4ff] shadow-[inset_0_0_15px_rgba(0,212,255,0.1)] font-semibold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom User / Session Section */}
      <div className="p-3 border-t border-white/[0.08]">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 mb-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-[11px] font-mono text-gray-300 truncate">
              {localStorage.getItem('userRole') || 'Admin'}
            </div>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00d4ff]/20 text-[#00d4ff] font-mono">
            SECURE
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-mono transition-colors flex items-center justify-center gap-1.5 border border-red-500/20"
        >
          <span>🚪</span>
          <span>Disconnect</span>
        </button>
      </div>
    </aside>
  );
}
