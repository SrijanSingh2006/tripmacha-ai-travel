import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Sun, Palmtree, Mountain, Building2 } from 'lucide-react';
import TripMachaLogo from '../components/TripMachaLogo'; 

export default function LandingPage({ onStart }) {
  const destinations = ["Goa", "Manali", "Kashmir", "Kerala", "Mumbai", "Bengaluru"];
  const [currentDest, setCurrentDest] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic destination carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDest((prev) => (prev + 1) % destinations.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 flex flex-col justify-between p-6 relative overflow-hidden font-sans selection:bg-indigo-100">
      
      {/* 🌤️ AMBIENT FLOATING TRAVEL ELEMENTS */}
      <div className="absolute top-16 left-12 animate-bounce duration-3000 opacity-20 pointer-events-none">
        <Sun className="w-20 h-20 text-amber-400" />
      </div>
      <div className="absolute bottom-24 left-1/4 animate-pulse opacity-25 pointer-events-none hidden md:block">
        <Palmtree className="w-16 h-16 text-emerald-500" />
      </div>
      <div className="absolute top-36 right-1/4 opacity-20 pointer-events-none animate-pulse">
        <Mountain className="w-24 h-24 text-slate-400" />
      </div>
      <div className="absolute bottom-16 right-16 opacity-15 pointer-events-none hidden sm:block">
        <Building2 className="w-20 h-20 text-indigo-500" />
      </div>

      {/* Brand Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between py-2 z-10">
        <div className="flex items-center gap-3">
          {/* Custom SVG Logo injected here */}
          <TripMachaLogo className="w-10 h-10 drop-shadow-md" />
          <span className="font-black text-2xl tracking-tight text-slate-900">
            TripMacha
          </span>
        </div>
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3.5 py-2 rounded-full border border-indigo-100 flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" /> India Launch v2.0
        </span>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto w-full text-center my-auto flex flex-col items-center z-10 relative">
        
        {/* 🔥 ADDICTIVE CONSUMER TAGLINE */}
        <div className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-white border border-fuchsia-100 shadow-sm mb-8 animate-fade-in">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
          </span>
          <span className="text-xs font-black bg-gradient-to-r from-fuchsia-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-widest">
            AI Sorted. Bags Packed. Go, Macha!
          </span>
        </div>

        {/* Dynamic Headliner */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] text-slate-900 max-w-4xl">
          Your Personal AI Agent <br />
          For Flights & Stays In{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-500 relative inline-block transition-all duration-500 ease-in-out min-w-[220px] text-left sm:text-center">
            {destinations[currentDest]}
            <span className="absolute right-0 bottom-1 w-full h-2 bg-indigo-100 -z-10 opacity-60"></span>
          </span>
        </h1>
        
        <p className="text-slate-500 mt-6 text-base sm:text-xl max-w-2xl font-medium leading-relaxed">
          Ditch the 50 open browser tabs. Tell our intelligence engine your budget restrictions, destinations, and duration—then sit back as we customize your ultimate travel pipeline.
        </p>

        {/* Main Action Call Trigger */}
        <button 
          onClick={onStart}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative mt-10 px-10 py-5 bg-slate-900 hover:bg-indigo-600 text-white text-lg font-bold rounded-2xl shadow-xl shadow-slate-900/10 hover:shadow-indigo-600/20 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2 overflow-hidden"
        >
          {/* Subtle light streak reflection overlay */}
          <div className="absolute inset-0 w-full h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:animate-shine" />
          
          Assemble My Trip 
          <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1.5' : ''}`} />
        </button>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 max-w-7xl mx-auto w-full text-xs font-medium text-slate-400 z-10">
        Built by the Squad. Tailored for the modern explorer.
      </footer>

    </div>
  );
}