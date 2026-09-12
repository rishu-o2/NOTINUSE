import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
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
    <aside className="fixed top-0 left-0 h-screen w-[220px] bg-[#141821] border-r border-[#252d3d] z-40 flex flex-col justify-between select-none">
      <div>
        {/* Brand / Logo */}
        <div className="p-4 border-b border-[#252d3d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#1a1f2e] border border-[#252d3d] flex items-center justify-center text-sm">
              📹
            </div>
            <div>
              <div className="font-semibold text-xs text-[#f1f5f9] leading-tight">
                Traffic Command
              </div>
              <div className="text-[11px] text-[#64748b]">
                BEL · SIH 2026
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-2 space-y-0.5 mt-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1a1f2e] text-[#3b82f6] border-l-2 border-[#3b82f6] font-semibold'
                    : 'text-[#64748b] hover:text-[#f1f5f9] hover:bg-[#1a1f2e]/60'
                }`
              }
            >
              <span className="text-sm">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User / Session Footer */}
      <div className="p-3 border-t border-[#252d3d]">
        <div className="flex items-center justify-between px-2.5 py-2 rounded bg-[#1a1f2e] border border-[#252d3d] mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
            <div className="text-xs font-medium text-[#f1f5f9]">
              {localStorage.getItem('userRole') || 'Admin'}
            </div>
          </div>
          <span className="text-[10px] text-[#64748b] font-mono">SYS-ADMIN</span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-1.5 px-3 rounded bg-[#1a1f2e] hover:bg-[#252d3d] text-[#ef4444] hover:text-red-300 text-xs transition-colors border border-[#252d3d] flex items-center justify-center gap-2"
        >
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
