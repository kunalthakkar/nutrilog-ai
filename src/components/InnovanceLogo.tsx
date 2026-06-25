import React, { useState } from "react";

interface InnovanceLogoProps {
  className?: string;
  variant?: "icon" | "header" | "full";
  id?: string;
}

export default function InnovanceLogo({ className = "", variant = "full", id }: InnovanceLogoProps) {
  const [logoSrc, setLogoSrc] = useState<string>("/logo.png");
  const [useSvg, setUseSvg] = useState(false);

  const handleImageError = () => {
    if (logoSrc === "/logo.png") {
      setLogoSrc("/innovance_logo.png");
    } else {
      setUseSvg(true);
    }
  };

  // If we have an uploaded image, use it for the non-icon variants
  if (!useSvg && variant !== "icon") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img
          id={id}
          src={logoSrc}
          alt="Innovance Techlabs"
          className="object-contain max-h-12 sm:max-h-14 w-auto h-auto select-none transition-all duration-350"
          onError={handleImageError}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // SVG drawing representing the official Innovance TechLabs dual-orbital loop with professional 3D weaving effect.
  
  if (variant === "icon") {
    return (
      <svg
        id={id}
        viewBox="0 0 180 180"
        className={`object-contain ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="orbitLightTeal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5bc2cd" />
            <stop offset="50%" stopColor="#259ab3" />
            <stop offset="100%" stopColor="#0c476c" />
          </linearGradient>
          
          <linearGradient id="orbitDeepNavy" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3ca2bb" />
            <stop offset="50%" stopColor="#1b6585" />
            <stop offset="100%" stopColor="#072d4c" />
          </linearGradient>
          <clipPath id="topRightWeave">
            <rect x="90" y="0" width="90" height="90" />
          </clipPath>
        </defs>

        {/* Orbit loop pointing right-up (Teal) - Background element */}
        <g id="orbit-teal-under">
          <ellipse 
            cx="90" 
            cy="90" 
            rx="70" 
            ry="22" 
            stroke="url(#orbitLightTeal)" 
            strokeWidth="5.5" 
            fill="none"
            transform="rotate(38 90 90)" 
            strokeLinecap="round" 
          />
          <ellipse 
            cx="88" 
            cy="92" 
            rx="78" 
            ry="27" 
            stroke="url(#orbitLightTeal)" 
            strokeWidth="1.5" 
            fill="none"
            strokeDasharray="210 110" 
            transform="rotate(38 88 92)" 
            strokeLinecap="round" 
          />
        </g>

        {/* Orbit loop pointing left-up (Navy) - Overlay element */}
        <g id="orbit-navy-middle">
          <ellipse 
            cx="90" 
            cy="90" 
            rx="72" 
            ry="25" 
            stroke="url(#orbitDeepNavy)" 
            strokeWidth="6" 
            fill="none"
            transform="rotate(-23 90 90)" 
            strokeLinecap="round" 
          />
          <ellipse 
            cx="91" 
            cy="89" 
            rx="80" 
            ry="29" 
            stroke="url(#orbitDeepNavy)" 
            strokeWidth="1.5" 
            fill="none"
            strokeDasharray="180 140" 
            transform="rotate(-23 91 89)" 
            strokeLinecap="round" 
          />
        </g>

        {/* Clip-Weave top-right of teal orbit on top of navy */}
        <g clipPath="url(#topRightWeave)" id="orbit-teal-weave">
          <ellipse 
            cx="90" 
            cy="90" 
            rx="70" 
            ry="22" 
            stroke="url(#orbitLightTeal)" 
            strokeWidth="5.5" 
            fill="none"
            transform="rotate(38 90 90)" 
            strokeLinecap="round" 
          />
          <ellipse 
            cx="88" 
            cy="92" 
            rx="78" 
            ry="27" 
            stroke="url(#orbitLightTeal)" 
            strokeWidth="1.5" 
            fill="none"
            strokeDasharray="210 110" 
            transform="rotate(38 88 92)" 
            strokeLinecap="round" 
          />
        </g>
      </svg>
    );
  }

  // Primary rendering for "full" or "header". Since SVG elements can include the orbits and text beautifully together,
  // we render a single unified wide SVG which can scale perfectly using standard Tailwind width on the parent container!
  return (
    <div id={id} className={`w-full h-auto select-none ${className}`} style={{ contentVisibility: "auto" }}>
      <svg
        viewBox="0 0 540 180"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="orbitLightTeal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5bc2cd" />
            <stop offset="50%" stopColor="#259ab3" />
            <stop offset="100%" stopColor="#0c476c" />
          </linearGradient>
          
          <linearGradient id="orbitDeepNavy" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3ca2bb" />
            <stop offset="50%" stopColor="#1b6585" />
            <stop offset="100%" stopColor="#072d4c" />
          </linearGradient>
          
          <clipPath id="topRightWeaveFull">
            <rect x="95" y="0" width="120" height="95" />
          </clipPath>
        </defs>

        {/* Orbit loop pointing right-up (Teal) - Background layer */}
        <g id="orbit-left-under">
          <ellipse 
            cx="95" 
            cy="85" 
            rx="70" 
            ry="22" 
            stroke="url(#orbitLightTeal)" 
            strokeWidth="5.5" 
            fill="none"
            transform="rotate(38 95 85)" 
            strokeLinecap="round" 
          />
          <ellipse 
            cx="93" 
            cy="87" 
            rx="78" 
            ry="27" 
            stroke="url(#orbitLightTeal)" 
            strokeWidth="1.5" 
            fill="none"
            strokeDasharray="210 110" 
            transform="rotate(38 93 87)" 
            strokeLinecap="round" 
          />
        </g>

        {/* Orbit loop pointing left-up (Navy) - Overlay middle layer */}
        <g id="orbit-right-middle">
          <ellipse 
            cx="95" 
            cy="85" 
            rx="72" 
            ry="25" 
            stroke="url(#orbitDeepNavy)" 
            strokeWidth="6" 
            fill="none"
            transform="rotate(-23 95 85)" 
            strokeLinecap="round" 
          />
          <ellipse 
            cx="96" 
            cy="84" 
            rx="80" 
            ry="29" 
            stroke="url(#orbitDeepNavy)" 
            strokeWidth="1.5" 
            fill="none"
            strokeDasharray="180 140" 
            transform="rotate(-23 96 84)" 
            strokeLinecap="round" 
          />
        </g>

        {/* 3D Weaving Part */}
        <g clipPath="url(#topRightWeaveFull)" id="orbit-right-top-weave">
          <ellipse 
            cx="95" 
            cy="85" 
            rx="70" 
            ry="22" 
            stroke="url(#orbitLightTeal)" 
            strokeWidth="5.5" 
            fill="none"
            transform="rotate(38 95 85)" 
            strokeLinecap="round" 
          />
          <ellipse 
            cx="93" 
            cy="87" 
            rx="78" 
            ry="27" 
            stroke="url(#orbitLightTeal)" 
            strokeWidth="1.5" 
            fill="none"
            strokeDasharray="210 110" 
            transform="rotate(38 93 87)" 
            strokeLinecap="round" 
          />
        </g>

        {/* Company Name Typographics perfectly matching Montserrat styling */}
        {/* We place them overlapping starting at x = 135, matching the attached image exactly */}
        <text 
          x="135" 
          y="74" 
          fill="#09345c" 
          fontFamily="'Montserrat', 'Inter', sans-serif" 
          fontWeight="900" 
          fontSize="54" 
          letterSpacing="0.01em"
        >
          INNOVANCE
        </text>
        
        <text 
          x="135" 
          y="130" 
          fill="#09345c" 
          fontFamily="'Montserrat', 'Inter', sans-serif" 
          fontWeight="800" 
          fontSize="54" 
          letterSpacing="0.05em"
        >
          TECHLABS
        </text>

        {/* Sub-tagline aligned at the bottom */}
        <text 
          x="135" 
          y="166" 
          fill="#155171" 
          fontFamily="'Montserrat', 'Inter', sans-serif" 
          fontWeight="600" 
          fontSize="14.5" 
          letterSpacing="0.08em"
        >
          Where Innovation Meets Advancement
        </text>
      </svg>
    </div>
  );
}
