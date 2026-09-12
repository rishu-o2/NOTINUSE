import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@bel.gov.in');
  const [password, setPassword] = useState('sih2026');
  const [role, setRole] = useState('Command Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (email === 'admin@bel.gov.in' && password === 'sih2026') {
      setIsLoading(true);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', email);

      setTimeout(() => {
        setIsLoading(false);
        navigate('/dashboard');
      }, 500);
    } else {
      setErrorMessage('Invalid credentials. Check email and password.');
    }
  };

  return (
    <div className="w-screen h-screen flex bg-[#0f1117] select-none">
      {/* Left 55% Showcase Panel */}
      <div className="w-[55%] bg-[#141821] border-r border-[#252d3d] p-12 flex flex-col justify-between hidden lg:flex">
        {/* Top Branding */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <span className="text-xl">📹</span>
            <span className="font-semibold text-sm text-[#f1f5f9] tracking-tight">
              Bharat Electronics Limited
            </span>
          </div>

          <h1 className="text-3xl font-bold text-[#f1f5f9] leading-tight mb-3">
            City-Wide AI Traffic Intelligence Platform
          </h1>
          <p className="text-sm text-[#64748b] leading-relaxed max-w-lg mb-6">
            Multi-Camera ANPR · Trajectory Tracking · Real-Time Urban Analytics System
          </p>

          {/* Feature Pills */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded bg-[#1a1f2e] border border-[#252d3d] text-xs text-[#f1f5f9] font-medium flex items-center gap-1.5">
              <span>📷</span> 8 Cameras
            </span>
            <span className="px-3 py-1.5 rounded bg-[#1a1f2e] border border-[#252d3d] text-xs text-[#f1f5f9] font-medium flex items-center gap-1.5">
              <span>🚗</span> ANPR Engine
            </span>
            <span className="px-3 py-1.5 rounded bg-[#1a1f2e] border border-[#252d3d] text-xs text-[#f1f5f9] font-medium flex items-center gap-1.5">
              <span>📊</span> Analytics
            </span>
          </div>
        </div>

        {/* Static Screenshot Style Preview */}
        <div className="w-full h-56 bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#64748b] border-b border-[#252d3d] pb-2">
            <span>Dashboard Preview</span>
            <span className="text-[#22c55e] font-mono">● Active System</span>
          </div>
          <div className="grid grid-cols-3 gap-3 my-auto">
            <div className="p-3 bg-[#141821] rounded border border-[#252d3d]">
              <div className="text-[10px] text-[#64748b]">LIVE VEHICLES</div>
              <div className="text-lg font-bold text-[#f1f5f9] mt-0.5">1,284</div>
            </div>
            <div className="p-3 bg-[#141821] rounded border border-[#252d3d]">
              <div className="text-[10px] text-[#64748b]">TRAJECTORIES</div>
              <div className="text-lg font-bold text-[#3b82f6] mt-0.5">327</div>
            </div>
            <div className="p-3 bg-[#141821] rounded border border-[#252d3d]">
              <div className="text-[10px] text-[#64748b]">OCR ACCURACY</div>
              <div className="text-lg font-bold text-[#22c55e] mt-0.5">94.2%</div>
            </div>
          </div>
          <div className="text-[11px] text-[#334155] font-mono text-center">
            Secured Government Traffic Node · NCR Grid
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="text-xs text-[#64748b]">
          Bharat Electronics Limited · SIH 2026
        </div>
      </div>

      {/* Right 45% Sign In Form */}
      <div className="w-full lg:w-[45%] bg-[#0f1117] flex items-center justify-center p-8">
        <div className="max-w-sm w-full bg-[#1a1f2e] border border-[#252d3d] rounded-lg p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#f1f5f9]">Sign In</h2>
            <p className="text-xs text-[#64748b] mt-1">
              Enter your credentials to access the command console.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1.5">
                Official Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@bel.gov.in"
                required
                className="w-full px-3 py-2 bg-[#141821] border border-[#252d3d] rounded text-xs text-[#f1f5f9] placeholder-[#334155] focus:outline-none focus:border-[#3b82f6]"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 bg-[#141821] border border-[#252d3d] rounded text-xs text-[#f1f5f9] placeholder-[#334155] focus:outline-none focus:border-[#3b82f6] pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#64748b] hover:text-[#f1f5f9]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Role Select */}
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1.5">
                Security Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-[#141821] border border-[#252d3d] rounded text-xs text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] cursor-pointer"
              >
                <option value="Command Admin">Command Admin</option>
                <option value="Traffic Officer">Traffic Officer</option>
                <option value="Surveillance Analyst">Surveillance Analyst</option>
              </select>
            </div>

            {/* Error Display */}
            {errorMessage && (
              <div className="p-2.5 rounded bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-xs">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#3b82f6] hover:bg-blue-600 active:bg-blue-700 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#252d3d] text-center">
            <div className="text-[11px] text-[#64748b]">
              Demo credentials: <span className="text-[#f1f5f9] font-mono">admin@bel.gov.in / sih2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
