"use client";

import Link from "next/link";

// Horizontal piano keys SVG - realistic proportions with deep shading
function HorizontalPianoKeysSVG() {
  return (
    <svg
      viewBox="0 0 1400 280"
      className="w-full h-full absolute inset-0"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Deep gradient for white keys */}
        <linearGradient id="whiteKeyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#b8b8b8" />
          <stop offset="3%" stopColor="#d0d0d0" />
          <stop offset="10%" stopColor="#e8e8e8" />
          <stop offset="25%" stopColor="#f5f5f5" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="75%" stopColor="#f8f8f8" />
          <stop offset="90%" stopColor="#e0e0e0" />
          <stop offset="97%" stopColor="#c8c8c8" />
          <stop offset="100%" stopColor="#a0a0a0" />
        </linearGradient>
        
        {/* Strong horizontal gradient for white key depth */}
        <linearGradient id="whiteKeyHorizontal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c0c0c0" />
          <stop offset="5%" stopColor="#e0e0e0" />
          <stop offset="15%" stopColor="#f5f5f5" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="85%" stopColor="#f0f0f0" />
          <stop offset="95%" stopColor="#d0d0d0" />
          <stop offset="100%" stopColor="#a8a8a8" />
        </linearGradient>
        
        {/* Rich gradient for black keys */}
        <linearGradient id="blackKeyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#606060" />
          <stop offset="3%" stopColor="#404040" />
          <stop offset="8%" stopColor="#303030" />
          <stop offset="20%" stopColor="#252525" />
          <stop offset="50%" stopColor="#1a1a1a" />
          <stop offset="80%" stopColor="#0d0d0d" />
          <stop offset="95%" stopColor="#050505" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
        
        {/* Black key horizontal shading */}
        <linearGradient id="blackKeyHorizontal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#252525" />
          <stop offset="10%" stopColor="#353535" />
          <stop offset="30%" stopColor="#2a2a2a" />
          <stop offset="70%" stopColor="#1a1a1a" />
          <stop offset="90%" stopColor="#101010" />
          <stop offset="100%" stopColor="#050505" />
        </linearGradient>
        
        {/* Shadow gradient for bottom of white keys */}
        <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="30%" stopColor="rgba(0,0,0,0.06)" />
          <stop offset="60%" stopColor="rgba(0,0,0,0.12)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
        </linearGradient>
        
        {/* Inner shadow for white keys */}
        <linearGradient id="innerShadowRight" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.18)" />
          <stop offset="20%" stopColor="rgba(0,0,0,0.08)" />
          <stop offset="50%" stopColor="rgba(0,0,0,0.02)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        
        <linearGradient id="innerShadowLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.08)" />
          <stop offset="30%" stopColor="rgba(0,0,0,0.02)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>
      
      {/* White keys - realistic piano proportions */}
      {Array.from({ length: 24 }, (_, i) => (
        <g key={`white-${i}`}>
          {/* Main white key body */}
          <rect
            x={i * 60}
            y="-30"
            width="58"
            height="290"
            fill="url(#whiteKeyGradient)"
          />
          {/* Horizontal shading overlay */}
          <rect
            x={i * 60}
            y="-30"
            width="58"
            height="290"
            fill="url(#whiteKeyHorizontal)"
            opacity="0.6"
          />
          {/* Left edge highlight */}
          <line
            x1={i * 60 + 1}
            y1="-30"
            x2={i * 60 + 1}
            y2="258"
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity="0.9"
          />
          {/* Inner shadow left side */}
          <rect
            x={i * 60}
            y="-30"
            width="12"
            height="290"
            fill="url(#innerShadowLeft)"
          />
          {/* Inner shadow right side */}
          <rect
            x={i * 60 + 40}
            y="-30"
            width="18"
            height="290"
            fill="url(#innerShadowRight)"
          />
          {/* Right edge deep shadow */}
          <line
            x1={i * 60 + 56}
            y1="-30"
            x2={i * 60 + 56}
            y2="258"
            stroke="#808080"
            strokeWidth="2.5"
          />
          {/* Secondary right edge */}
          <line
            x1={i * 60 + 54}
            y1="-30"
            x2={i * 60 + 54}
            y2="258"
            stroke="#a0a0a0"
            strokeWidth="1"
          />
          {/* Bottom edge shadow */}
          <line
            x1={i * 60 + 2}
            y1="258"
            x2={i * 60 + 56}
            y2="258"
            stroke="#909090"
            strokeWidth="3"
          />
          {/* Key separator line */}
          <line
            x1={i * 60 + 58}
            y1="-30"
            x2={i * 60 + 58}
            y2="260"
            stroke="#606060"
            strokeWidth="2"
          />
          {/* Bottom shadow gradient */}
          <rect
            x={i * 60}
            y="180"
            width="58"
            height="80"
            fill="url(#shadowGradient)"
          />
          {/* Corner shadows */}
          <rect
            x={i * 60 + 48}
            y="240"
            width="10"
            height="20"
            fill="rgba(0,0,0,0.12)"
          />
        </g>
      ))}
      
      {/* Black keys - MUCH LONGER, realistic proportions (about 2/3 of white key length) */}
      {[0, 1, 3, 4, 5, 7, 8, 10, 11, 12, 14, 15, 17, 18, 19, 21, 22].map((i, idx) => (
        <g key={`black-${idx}`}>
          {/* Deepest shadow layer */}
          <rect
            x={i * 60 + 42}
            y="-26"
            width="38"
            height="195"
            fill="rgba(0,0,0,0.6)"
            rx="2"
          />
          {/* Secondary shadow */}
          <rect
            x={i * 60 + 40}
            y="-28"
            width="40"
            height="192"
            fill="rgba(0,0,0,0.4)"
            rx="2"
          />
          {/* Main black key body */}
          <rect
            x={i * 60 + 38}
            y="-30"
            width="42"
            height="188"
            fill="url(#blackKeyGradient)"
            rx="2"
          />
          {/* Horizontal shading overlay */}
          <rect
            x={i * 60 + 38}
            y="-30"
            width="42"
            height="188"
            fill="url(#blackKeyHorizontal)"
            opacity="0.7"
          />
          {/* Top glossy highlight strip */}
          <rect
            x={i * 60 + 41}
            y="-26"
            width="36"
            height="8"
            fill="rgba(255,255,255,0.2)"
            rx="1"
          />
          {/* Secondary highlight */}
          <rect
            x={i * 60 + 43}
            y="-22"
            width="32"
            height="3"
            fill="rgba(255,255,255,0.1)"
            rx="1"
          />
          {/* Left edge highlight */}
          <line
            x1={i * 60 + 39}
            y1="-26"
            x2={i * 60 + 39}
            y2="154"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="2"
          />
          {/* Right edge deep shadow */}
          <line
            x1={i * 60 + 79}
            y1="-26"
            x2={i * 60 + 79}
            y2="156"
            stroke="#000000"
            strokeWidth="2.5"
          />
          {/* Bottom edge shadow */}
          <line
            x1={i * 60 + 40}
            y1="157"
            x2={i * 60 + 78}
            y2="157"
            stroke="#000000"
            strokeWidth="3"
          />
          {/* Bottom rounded tip */}
          <rect
            x={i * 60 + 40}
            y="148"
            width="38"
            height="10"
            fill="rgba(0,0,0,0.5)"
            rx="3"
          />
          {/* Glossy reflection on body */}
          <rect
            x={i * 60 + 41}
            y="20"
            width="4"
            height="80"
            fill="rgba(255,255,255,0.04)"
            rx="2"
          />
        </g>
      ))}
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen min-h-dvh flex flex-col bg-white text-black overflow-hidden">
      {/* Top - Piano keys */}
      <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden flex-shrink-0">
        <HorizontalPianoKeysSVG />
      </div>

      {/* Center - Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Logo */}
        <h1
          className="text-5xl md:text-7xl font-bold tracking-tight mb-5"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          PRONIA
        </h1>

        {/* Tagline */}
        <p
          className="text-gray-800 text-center mb-10 text-base md:text-lg"
          style={{ fontFamily: "Courier New, Courier, monospace" }}
        >
          Proof you actually practiced
        </p>

        {/* Buttons - Hemingway style, stacked vertically */}
        <div className="flex flex-col gap-3 w-full max-w-[280px]">
          <Link
            href="/login"
            className="px-12 py-4 bg-black text-white text-center tracking-wide hover:bg-gray-900 transition-colors"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-12 py-4 bg-white text-black text-center tracking-wide border border-black hover:bg-gray-50 transition-colors"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="pb-6 pt-8 px-6 flex-shrink-0">
        {/* Made by text */}
        <p 
          className="text-center text-gray-500 text-sm mb-1"
          style={{ fontFamily: "Courier New, Courier, monospace" }}
        >
          App for musicians made by a musician.
        </p>
        <p 
          className="text-center text-gray-500 text-sm mb-4"
          style={{ fontFamily: "Courier New, Courier, monospace" }}
        >
          Made in Mississippi.{" "}
          <a 
            href="https://michaelanunn.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-black hover:underline"
          >
            Michaelanunn.com
          </a>
        </p>
        
        {/* Divider line */}
        <div className="border-t border-gray-200 mb-4" />
        
        {/* Footer links */}
        <div 
          className="flex items-center justify-center gap-6 text-sm text-gray-500"
          style={{ fontFamily: "Courier New, Courier, monospace" }}
        >
          <Link href="/tos" className="hover:text-black transition-colors">
            Terms of Service
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/privacy" className="hover:text-black transition-colors">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
