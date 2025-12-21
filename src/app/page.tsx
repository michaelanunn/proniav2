"use client";

import Link from "next/link";

// Hand-drawn style vertical piano keys SVG - extends beyond viewport with enhanced shading
function PianoKeysSVG() {
  return (
    <svg
      viewBox="0 0 180 800"
      className="h-[140vh] w-auto absolute -left-10 -top-[20vh]"
      fill="none"
      preserveAspectRatio="xMinYMid slice"
    >
      <defs>
        {/* Enhanced gradient for white keys - more depth */}
        <linearGradient id="whiteKeyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e8e8e8" />
          <stop offset="15%" stopColor="#f8f8f8" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="85%" stopColor="#f5f5f5" />
          <stop offset="100%" stopColor="#d8d8d8" />
        </linearGradient>
        
        {/* Vertical gradient for white key pressed look */}
        <linearGradient id="whiteKeyVertical" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fafafa" />
          <stop offset="70%" stopColor="#f0f0f0" />
          <stop offset="100%" stopColor="#e0e0e0" />
        </linearGradient>
        
        {/* Enhanced gradient for black keys - more glossy */}
        <linearGradient id="blackKeyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0a0a0a" />
          <stop offset="20%" stopColor="#252525" />
          <stop offset="45%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
        
        {/* Top-to-bottom gradient for black keys */}
        <linearGradient id="blackKeyHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#404040" />
          <stop offset="8%" stopColor="#2a2a2a" />
          <stop offset="40%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#080808" />
        </linearGradient>
        
        {/* Shadow gradient */}
        <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.15)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>
      
      {/* White keys */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
        <g key={`white-${i}`}>
          {/* Main white key body with combined gradients */}
          <rect
            x="0"
            y={i * 62}
            width="165"
            height="60"
            fill="url(#whiteKeyGradient)"
          />
          {/* Overlay for vertical shading */}
          <rect
            x="0"
            y={i * 62}
            width="165"
            height="60"
            fill="url(#whiteKeyVertical)"
            opacity="0.5"
          />
          {/* Left edge highlight */}
          <line
            x1="2"
            y1={i * 62 + 2}
            x2="2"
            y2={i * 62 + 58}
            stroke="#ffffff"
            strokeWidth="2"
            opacity="0.8"
          />
          {/* Bottom edge shadow */}
          <line
            x1="3"
            y1={i * 62 + 58}
            x2="162"
            y2={i * 62 + 58}
            stroke="#a0a0a0"
            strokeWidth="2"
          />
          {/* Right edge shadow */}
          <line
            x1="164"
            y1={i * 62 + 2}
            x2="164"
            y2={i * 62 + 58}
            stroke="#c0c0c0"
            strokeWidth="2"
          />
          {/* Inner shadow near right */}
          <rect
            x="145"
            y={i * 62}
            width="20"
            height="60"
            fill="url(#shadowGradient)"
            transform="rotate(180 155 ${i * 62 + 30})"
            opacity="0.3"
          />
          {/* Key separator line */}
          <line
            x1="0"
            y1={i * 62 + 60}
            x2="165"
            y2={i * 62 + 60}
            stroke="#888"
            strokeWidth="1.5"
          />
          {/* Top separator */}
          <line
            x1="0"
            y1={i * 62}
            x2="165"
            y2={i * 62}
            stroke="#bbb"
            strokeWidth="0.5"
          />
        </g>
      ))}
      
      {/* Black keys with enhanced shading */}
      {[0, 1, 3, 4, 5, 7, 8, 10, 11].map((i, idx) => (
        <g key={`black-${idx}`}>
          {/* Deep shadow underneath */}
          <rect
            x="4"
            y={i * 62 + 44}
            width="93"
            height="36"
            fill="rgba(0,0,0,0.4)"
            rx="2"
          />
          {/* Secondary shadow */}
          <rect
            x="2"
            y={i * 62 + 42}
            width="94"
            height="37"
            fill="rgba(0,0,0,0.25)"
            rx="1"
          />
          {/* Main black key body */}
          <rect
            x="0"
            y={i * 62 + 40}
            width="95"
            height="36"
            fill="url(#blackKeyHighlight)"
            rx="1"
          />
          {/* Glossy top highlight */}
          <rect
            x="3"
            y={i * 62 + 42}
            width="88"
            height="4"
            fill="rgba(255,255,255,0.12)"
            rx="1"
          />
          {/* Subtle top edge shine */}
          <line
            x1="5"
            y1={i * 62 + 41}
            x2="90"
            y2={i * 62 + 41}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
          {/* Left edge subtle highlight */}
          <line
            x1="1"
            y1={i * 62 + 43}
            x2="1"
            y2={i * 62 + 73}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
          {/* Right edge depth */}
          <line
            x1="94"
            y1={i * 62 + 42}
            x2="94"
            y2={i * 62 + 74}
            stroke="#000"
            strokeWidth="1"
          />
        </g>
      ))}
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-row bg-white text-black overflow-hidden relative">
      {/* Left side - Piano keys (desktop only) - extends off screen */}
      <div className="hidden md:block absolute left-0 top-0 bottom-0 w-40 overflow-visible">
        <PianoKeysSVG />
      </div>

      {/* Center/Right side - Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 md:pl-48">
        {/* Mobile piano keys - horizontal version with enhanced shading */}
        <div className="md:hidden mb-10 w-full overflow-hidden -mx-6">
          <svg viewBox="0 0 500 80" className="w-[120%] h-auto -ml-[10%]" fill="none">
            <defs>
              <linearGradient id="mobileWhiteKey" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fafafa" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="80%" stopColor="#f0f0f0" />
                <stop offset="100%" stopColor="#d5d5d5" />
              </linearGradient>
              <linearGradient id="mobileBlackKey" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#454545" />
                <stop offset="10%" stopColor="#2a2a2a" />
                <stop offset="50%" stopColor="#1a1a1a" />
                <stop offset="100%" stopColor="#050505" />
              </linearGradient>
            </defs>
            {/* White keys */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <g key={`mobile-white-${i}`}>
                <rect
                  x={i * 50}
                  y="5"
                  width="48"
                  height="70"
                  fill="url(#mobileWhiteKey)"
                  stroke="#999"
                  strokeWidth="1"
                />
                <line
                  x1={i * 50 + 46}
                  y1="8"
                  x2={i * 50 + 46}
                  y2="72"
                  stroke="#bbb"
                  strokeWidth="1.5"
                />
              </g>
            ))}
            {/* Black keys */}
            {[0, 1, 3, 4, 5, 7, 8].map((i, idx) => (
              <g key={`mobile-black-${idx}`}>
                <rect
                  x={i * 50 + 35}
                  y="7"
                  width="30"
                  height="42"
                  fill="rgba(0,0,0,0.3)"
                  rx="1"
                />
                <rect
                  x={i * 50 + 33}
                  y="5"
                  width="30"
                  height="40"
                  fill="url(#mobileBlackKey)"
                  rx="1"
                />
                <rect
                  x={i * 50 + 35}
                  y="7"
                  width="26"
                  height="3"
                  fill="rgba(255,255,255,0.1)"
                  rx="1"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Logo */}
        <h1
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          PRONIA
        </h1>

        {/* Tagline */}
        <p
          className="text-gray-600 text-center mb-12 text-base md:text-lg"
          style={{ fontFamily: "Courier New, Courier, monospace" }}
        >
          Proof you actually practiced
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="px-10 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-center min-w-[140px]"
          >
            Log In
          </Link>
          <Link
            href="/onboarding"
            className="px-10 py-3 bg-white text-black font-semibold rounded-lg border-2 border-black hover:bg-gray-50 transition-colors text-center min-w-[140px]"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
