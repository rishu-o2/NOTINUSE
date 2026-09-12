import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BOOT_MESSAGES = [
  'Initializing Traffic Command Center...',
  'Connecting to ANPR Camera Network...',
  'Loading AI Detection Engine...',
  'Establishing Secure Connection...',
  'System Ready.'
];

export default function CountdownPage() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [count, setCount] = useState(5);
  const [currentStep, setCurrentStep] = useState(0);

  // Canvas particle network animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const PARTICLE_COUNT = 160;
    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() > 0.85 ? Math.random() * 2.5 + 2 : Math.random() * 1.5 + 0.6,
        speed: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        baseAlpha: Math.random() * 0.8 + 0.2,
        drift: (Math.random() - 0.5) * 0.5
      });
    }

    const render = () => {
      ctx.fillStyle = '#050a18';
      ctx.fillRect(0, 0, width, height);

      // Draw trails / network connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            const lineAlpha = (1 - dist / 90) * 0.25 * Math.min(particles[i].alpha, particles[j].alpha);
            ctx.strokeStyle = `rgba(0, 212, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw & update particles
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += p.drift;
        // Fade out as it ascends
        const heightRatio = p.y / height;
        p.alpha = p.baseAlpha * Math.max(0.1, heightRatio);

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
          p.alpha = p.baseAlpha;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${p.alpha})`;
        ctx.shadowBlur = p.radius > 2 ? 12 : 4;
        ctx.shadowColor = '#00d4ff';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Countdown and message sequencing
  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            navigate('/login');
          }, 500);
          return 0;
        }
        return prev - 1;
      });

      setCurrentStep((prev) => (prev < BOOT_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const progressPercent = ((5 - count) / 5) * 100;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050a18] select-none flex flex-col justify-between items-center py-10">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Top Header */}
      <div className="relative z-10 text-center tracking-widest text-xs md:text-sm font-semibold text-[#00d4ff] uppercase bg-white/[0.03] backdrop-blur-md px-6 py-2.5 rounded-full border border-[#00d4ff]/30 shadow-[0_0_20px_rgba(0,212,255,0.15)]">
        BHARAT ELECTRONICS LIMITED · SIH 2026
      </div>

      {/* Central HUD / Countdown */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        {/* Giant Counter */}
        <div
          className="font-black text-white leading-none tracking-tight text-center text-glow"
          style={{ fontSize: 'clamp(100px, 20vw, 180px)' }}
        >
          {count}
        </div>

        {/* Progress Bar */}
        <div className="w-72 md:w-96 h-2 bg-slate-900/80 rounded-full mt-4 overflow-hidden border border-[#00d4ff]/30 p-[1px] shadow-[0_0_15px_rgba(0,212,255,0.2)]">
          <div
            className="h-full bg-gradient-to-r from-[#00d4ff]/70 to-[#00d4ff] rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_#00d4ff]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Boot Messages */}
        <div className="mt-8 flex flex-col items-center gap-1.5 min-h-[140px]">
          {BOOT_MESSAGES.map((msg, index) => {
            const isCurrent = index === currentStep;
            const isCompleted = index < currentStep;
            const isFuture = index > currentStep;

            if (isFuture) return null;

            return (
              <div
                key={msg}
                className={`text-xs md:text-sm tracking-wide font-mono transition-all duration-500 flex items-center gap-2 ${
                  isCurrent
                    ? 'text-[#00d4ff] font-medium scale-105 opacity-100 drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]'
                    : isCompleted
                    ? 'text-gray-400 opacity-60'
                    : 'opacity-0'
                }`}
              >
                <span className={isCurrent ? 'animate-pulse text-[#00d4ff]' : 'text-gray-500'}>
                  {isCompleted ? '✓' : '>'}
                </span>
                <span>{msg}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 text-[11px] font-mono text-gray-500 tracking-wider">
        AI URBAN TRAFFIC COMMAND SYSTEM · v2.6.0-INIT
      </div>
    </div>
  );
}
