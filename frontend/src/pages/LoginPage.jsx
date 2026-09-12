import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CityScene from '../components/CityScene';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@bel.gov.in');
  const [password, setPassword] = useState('sih2026');
  const [role, setRole] = useState('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setHasError(false);
    setErrorMessage('');

    if (email === 'admin@bel.gov.in' && password === 'sih2026') {
      setLoading(true);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', email);

      setTimeout(() => {
        setLoading(false);
        navigate('/dashboard');
      }, 1500);
    } else {
      setHasError(true);
      setErrorMessage('Invalid credentials. Check email & password.');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050a18] flex items-center justify-center select-none">
      {/* 3D Background City Scene */}
      <CityScene opacity={0.85} interactive={false} />

      {/* Glassmorphism Login Card */}
      <div
        className={`relative z-10 w-[90%] max-w-[380px] p-7 rounded-[20px] backdrop-blur-[20px] bg-white/[0.04] border ${
          hasError ? 'border-red-500/80 shadow-[0_0_40px_rgba(239,68,68,0.25)] animate-shake' : 'border-[#00d4ff]/25 shadow-[0_0_60px_rgba(0,212,255,0.08)]'
        } transition-all duration-300 flex flex-col items-center`}
      >
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-full bg-white/[0.05] border border-[#00d4ff]/30 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(0,212,255,0.2)] mb-3">
          📡
        </div>

        {/* Titles */}
        <h1 className="text-white font-bold text-[20px] text-center tracking-tight">
          Traffic Command Center
        </h1>
        <p className="text-[#00d4ff] text-[10px] tracking-[0.25em] font-semibold uppercase mt-1 mb-6 text-center text-glow">
          Authorized Personnel Only
        </p>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-mono text-gray-300 mb-1 tracking-wide">
              SECURITY IDENTIFIER (EMAIL)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@bel.gov.in"
              required
              className={`w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] text-white text-sm outline-none border transition-all placeholder-gray-500 ${
                hasError
                  ? 'border-red-500/80 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                  : 'border-white/10 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/50'
              }`}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-mono text-gray-300 mb-1 tracking-wide">
              PASSPHRASE
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] text-white text-sm outline-none border transition-all placeholder-gray-500 pr-10 ${
                  hasError
                    ? 'border-red-500/80 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                    : 'border-white/10 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/50'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00d4ff] text-xs font-mono transition-colors"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          {/* Role Dropdown */}
          <div>
            <label className="block text-xs font-mono text-gray-300 mb-1 tracking-wide">
              OPERATIONAL ROLE
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1428] text-white text-sm outline-none border border-white/10 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/50 transition-all cursor-pointer"
            >
              <option value="Admin">Admin · Full Clearance</option>
              <option value="Traffic Officer">Traffic Officer · Command Unit</option>
              <option value="Field Official">Field Official · Surveillance</option>
            </select>
          </div>

          {/* Error Message */}
          {hasError && (
            <div className="text-red-400 text-xs font-mono text-center bg-red-950/40 border border-red-500/30 py-1.5 px-2 rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0088cc] hover:from-[#33ddff] hover:to-[#00aaff] text-[#050a18] font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(0,212,255,0.4)] hover:shadow-[0_0_35px_rgba(0,212,255,0.7)] active:scale-[0.98] disabled:opacity-75 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-[#050a18]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Authenticating...</span>
              </>
            ) : (
              'Access Command Console'
            )}
          </button>
        </form>

        {/* Card Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 w-full text-center">
          <p className="text-[10px] font-mono text-gray-400 tracking-wider">
            SIH 2026 · Bharat Electronics Limited
          </p>
        </div>
      </div>
    </div>
  );
}
