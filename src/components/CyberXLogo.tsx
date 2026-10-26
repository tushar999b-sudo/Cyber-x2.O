import React from "react";

interface LogoProps {
  className?: string;
}

// Sidebar icon
export function LogoIcon({ className = "" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <polygon
        points="50,4 91,27 91,73 50,96 9,73 9,27"
        stroke="#777"
        strokeWidth="2"
        fill="#0b0b0b"
      />

      <polygon
        points="50,13 82,31 82,69 50,87 18,69 18,31"
        stroke="#bcbcbc"
        strokeWidth="3"
      />

      <path
        d="M38 37 L55 50 L38 63"
        stroke="#8bff9a"
        strokeWidth="6"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />

      <path
        d="M49 69 H66"
        stroke="#8bff9a"
        strokeWidth="6"
        strokeLinecap="square"
      />
    </svg>
  );
}

// Full hero logo
export function FullLogo({ className = "" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 1100 300"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className={className}
      role="img"
      aria-label="CYBER-X Terminal Logo"
    >
      <defs>
        <linearGradient id="cyberBanner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#252525" />
          <stop offset="100%" stopColor="#080808" />
        </linearGradient>

        <linearGradient id="cyberGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c1ffcb" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>

        <filter id="greenGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer geometric frame */}
      <path
        d="M30 150 L115 25 H310 L395 150 L310 275 H115 Z"
        stroke="#f0f0f0"
        strokeWidth="2"
      />

      {/* Main hexagon */}
      <polygon
        points="140,43 285,43 355,150 285,257 140,257 70,150"
        fill="#080808"
        stroke="#eeeeee"
        strokeWidth="5"
      />

      {/* Inner segmented hexagon */}
      <path
        d="M145 61 H278 L335 150 L278 239 H145 L88 150 Z"
        stroke="#8c8c8c"
        strokeWidth="12"
        strokeDasharray="90 20 55 25"
      />

      <path
        d="M163 83 H266 L310 150 L266 217 H163 L119 150 Z"
        stroke="#ffffff"
        strokeWidth="3"
      />

      {/* Terminal symbol */}
      <path
        d="M165 115 L220 150 L165 185"
        stroke="url(#cyberGreen)"
        strokeWidth="13"
        strokeLinecap="square"
        strokeLinejoin="miter"
        filter="url(#greenGlow)"
      />

      <path
        d="M222 199 H270"
        stroke="url(#cyberGreen)"
        strokeWidth="13"
        strokeLinecap="square"
        filter="url(#greenGlow)"
      />

      {/* Divider */}
      <path
        d="M430 36 L465 150 L430 264"
        stroke="#ffffff"
        strokeWidth="2"
      />

      {/* TERMUX label plate */}
      <path
        d="M490 64 H620 L646 88 H690 L707 103 H490 Z"
        fill="#101010"
        stroke="#d6d6d6"
        strokeWidth="2"
      />

      <text
        x="510"
        y="91"
        fill="#ffffff"
        fontSize="20"
        fontFamily="monospace"
        fontWeight="700"
        letterSpacing="2"
      >
        TERMUX
      </text>

      <circle
        cx="625"
        cy="82"
        r="8"
        stroke="#86efac"
        strokeWidth="3"
      />

      <circle cx="625" cy="82" r="3" fill="#86efac" />

      {/* Main cyber banner */}
      <path
        d="M490 112 H640 L685 145 H1005 L1040 165 L1005 185 H685 L640 218 H490 Z"
        fill="url(#cyberBanner)"
        stroke="#dedede"
        strokeWidth="3"
      />

      {/* Banner highlights */}
      <path
        d="M510 122 H633 L671 153 H1017"
        stroke="#ffffff"
        strokeWidth="5"
      />

      <path
        d="M510 208 H633 L671 177 H1017"
        stroke="#a1a1aa"
        strokeWidth="3"
      />

      {/* Top circuit details */}
      <path
        d="M790 112 L812 99 H920 L936 112 H960"
        stroke="#ffffff"
        strokeWidth="3"
      />

      {Array.from({ length: 8 }).map((_, i) => (
        <path
          key={i}
          d={`M${808 + i * 13} 104 l-7 8`}
          stroke="#ffffff"
          strokeWidth="3"
        />
      ))}

      {/* CYBER-X title */}
      <text
        x="845"
        y="174"
        fill="#ffffff"
        fontSize="65"
        fontWeight="900"
        fontFamily="Arial, Helvetica, sans-serif"
        letterSpacing="2"
        textAnchor="middle"
      >
        CYBER-X
      </text>

      {/* Bottom circuit line */}
      <path
        d="M515 232 H1000"
        stroke="#bfbfbf"
        strokeWidth="2"
        strokeDasharray="3 5"
      />

      <path
        d="M515 240 H1000"
        stroke="#ffffff"
        strokeWidth="2"
      />

      <circle cx="510" cy="232" r="5" fill="#ffffff" />
      <circle cx="528" cy="232" r="5" fill="#ffffff" />
      <circle
        cx="546"
        cy="232"
        r="5"
        stroke="#ffffff"
        strokeWidth="2"
      />
    </svg>
  );
}
