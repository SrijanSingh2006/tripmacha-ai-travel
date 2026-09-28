import React from 'react';

export default function TripMachaLogo({ className = "w-8 h-8" }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        {/* Core Brand Gradient (Indigo to Fuchsia) */}
        <linearGradient id="machaGradient" x1="0" y1="0" x2="100" y2="100">
          <stop stopColor="#4F46E5" /> {/* Indigo-600 */}
          <stop offset="1" stopColor="#D946EF" /> {/* Fuchsia-500 */}
        </linearGradient>
      </defs>
      
      {/* Left Lens */}
      <path 
        d="M15 45 C15 30, 45 30, 45 50 C45 75, 15 75, 15 45 Z" 
        fill="url(#machaGradient)" 
        opacity="0.95" 
      />
      
      {/* Right Lens */}
      <path 
        d="M55 45 C55 30, 85 30, 85 50 C85 75, 55 75, 55 45 Z" 
        fill="url(#machaGradient)" 
        opacity="0.95" 
      />
      
      {/* Sunglasses Bridge */}
      <path 
        d="M42 38 Q50 32 58 38" 
        stroke="url(#machaGradient)" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
      
      {/* Airplane taking off in the reflection of the right lens */}
      <g className="animate-pulse">
        {/* Plane Body */}
        <path d="M60 60 L75 45 L80 48 L70 65 Z" fill="#ffffff" />
        {/* Plane Wings */}
        <path d="M68 53 L78 50 L75 58 Z" fill="#ffffff" />
      </g>
    </svg>
  );
}