import React, { useEffect, useState } from 'react';

export default function AppSplashScreen({ onFinish }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // 4.2 second par smooth fade-out complete hoga taaki bada visual saaf aur aaram se enjoy ho
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 500);
    }, 4200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#FCFBF5] flex flex-col items-center justify-center overflow-hidden select-none transition-opacity duration-500 ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Background Deep Luxury Ambient Glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#5B0015]/15 via-[#80AEE8]/20 to-transparent blur-3xl animate-pulse" />

      {/* ── 🦋 LARGE HD BUTTERFLY CONTAINER ── */}
      <div className="absolute inset-0 pointer-events-none butterfly-stage">
        <div className="butterfly-actor">
          <svg viewBox="0 0 100 100" className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 drop-shadow-[0_16px_32px_rgba(91,0,21,0.35)]">
            <defs>
              <linearGradient id="roseWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A82846" />
                <stop offset="50%" stopColor="#5B0015" />
                <stop offset="100%" stopColor="#80AEE8" />
              </linearGradient>
              <linearGradient id="wingGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#80AEE8" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Left Big Wing */}
            <g className="wing wing-left origin-[50px_50px]">
              <path 
                d="M50 50 C25 15 -2 30 10 65 C18 85 45 72 50 50 Z" 
                fill="url(#roseWingGrad)" 
              />
              <path 
                d="M50 50 C32 25 10 38 18 60 C24 70 42 64 50 50 Z" 
                fill="url(#wingGlow)" 
              />
              <circle cx="25" cy="48" r="3.5" fill="#FCFBF5" opacity="0.6" />
              <circle cx="35" cy="38" r="2" fill="#80AEE8" opacity="0.8" />
            </g>

            {/* Right Big Wing */}
            <g className="wing wing-right origin-[50px_50px]">
              <path 
                d="M50 50 C75 15 102 30 90 65 C82 85 55 72 50 50 Z" 
                fill="url(#roseWingGrad)" 
              />
              <path 
                d="M50 50 C68 25 90 38 82 60 C76 70 58 64 50 50 Z" 
                fill="url(#wingGlow)" 
              />
              <circle cx="75" cy="48" r="3.5" fill="#FCFBF5" opacity="0.6" />
              <circle cx="65" cy="38" r="2" fill="#80AEE8" opacity="0.8" />
            </g>

            {/* Butterfly Center Body & Antennae */}
            <ellipse cx="50" cy="52" rx="3.5" ry="14" fill="#3D000E" />
            <path d="M48 40 Q40 26 34 27" stroke="#3D000E" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M52 40 Q60 26 66 27" stroke="#3D000E" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="34" cy="27" r="1.8" fill="#80AEE8" />
            <circle cx="66" cy="27" r="1.8" fill="#80AEE8" />
          </svg>
        </div>
      </div>

      {/* ── 🌸 LARGE HERBALANCE LOGO REVEAL ── */}
      <div className="relative z-10 flex flex-col items-center app-logo-reveal">
        <div className="relative mb-5">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-[#5B0015] via-[#8C243B] to-[#80AEE8] opacity-35 blur-xl animate-pulse" />
          <img
            src="/pcod_logo.jpeg"
            alt="HerBalance Logo"
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full object-cover shadow-[0_20px_50px_rgba(91,0,21,0.3)] border-4 border-[#EDE5CD] relative z-10"
          />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#5B0015] tracking-tight">
          HerBalance
        </h1>
        <p className="text-xs sm:text-sm font-extrabold text-[#80AEE8] tracking-[0.25em] uppercase mt-2">
          Hormone & Cycle Companion
        </p>
      </div>

      {/* ── 🎬 HD FLIGHT KEYFRAMES ── */}
      <style>{`
        .butterfly-actor {
          position: absolute;
          animation: flyTrajectory 3.8s cubic-bezier(0.35, 0.05, 0.2, 1) forwards;
        }

        @keyframes flyTrajectory {
          /* Step 1: Bottom-left se entry */
          0% {
            left: -20%;
            top: 115%;
            transform: scale(0.85) rotate(35deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          /* Step 2: Center par float hokar aana */
          42% {
            left: 42%;
            top: 42%;
            transform: scale(1.4) rotate(8deg);
          }
          /* Step 3: Center par grand fluttering pause */
          58% {
            left: 44%;
            top: 40%;
            transform: scale(1.6) rotate(-5deg);
            opacity: 1;
          }
          74% {
            left: 46%;
            top: 38%;
            transform: scale(1.5) rotate(10deg);
            opacity: 1;
          }
          /* Step 4: Top-right corner se ud jana */
          100% {
            left: 125%;
            top: -25%;
            transform: scale(0.9) rotate(45deg);
            opacity: 0;
          }
        }

        /* Smooth Wing Flutter Keyframes */
        .wing-left {
          animation: flutterLeft 0.16s ease-in-out infinite alternate;
        }
        .wing-right {
          animation: flutterRight 0.16s ease-in-out infinite alternate;
        }

        @keyframes flutterLeft {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0.18); }
        }

        @keyframes flutterRight {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0.18); }
        }

        /* Large Logo Reveal Animation */
        .app-logo-reveal {
          opacity: 0;
          transform: scale(0.8);
          animation: logoShow 0.85s cubic-bezier(0.16, 1, 0.3, 1) 2.65s forwards;
        }

        @keyframes logoShow {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}