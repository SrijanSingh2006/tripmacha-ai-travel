import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import LiveComparisonDashboard from '../components/dashboard/LiveComparisonDashboard.jsx';
import { Sparkles, ArrowRight, Layers, Hammer } from 'lucide-react';
import DIYSearchForm from '../components/dashboard/DIYSearchForm.jsx';
import TourSearchForm from '../components/dashboard/TourSearchForm.jsx';
import TripMachaLogo from '../components/TripMachaLogo.jsx'; // Imported Custom Logo

export default function HybridPlanner() {
  const [scrapedData, setScrapedData] = useState(null);
  const [user, setUser] = useState(null);
  const [searchMode, setSearchMode] = useState('diy'); // Defaulting to 'diy' layout
  const [isSearching, setIsSearching] = useState(false);

  const GOOGLE_CLIENT_ID = "831174545590-ddrt6q41a7ojdp38ccfr6b7lpeupmd3a.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex flex-col min-h-screen w-full bg-slate-50 font-sans select-none">
        
        {/* Customer Context Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between flex-shrink-0 z-30 shadow-sm sticky top-0">
          <div className="flex items-center gap-3">
            {/* Custom SVG Logo injected here */}
            <TripMachaLogo className="w-8 h-8 drop-shadow-sm" />
            <span className="font-black text-gray-900 tracking-tight text-lg">TripMacha</span>
          </div>

          {/* User Guide Path */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-gray-500">
            <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50/70 px-2.5 py-1 rounded-md">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
              <span>Pick DIY or Tours</span>
            </div>
            <ArrowRight className="w-3 h-3 text-gray-300" />
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-[10px]">2</span>
              <span>AI Compares Live Scrapers</span>
            </div>
          </div>

          {/* Google Auth & Security Badge */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <Sparkles className="w-3 h-3 text-emerald-500" /> AI Engine Active
            </div>
            
            {/* GOOGLE LOGIN WIDGET */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 py-1 pl-1 pr-3 rounded-full">
                <img src={user.picture} alt="Profile" className="w-8 h-8 rounded-full" />
                <span className="text-sm font-bold text-slate-700">{user.given_name}</span>
              </div>
            ) : (
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  const decoded = jwtDecode(credentialResponse.credential);
                  setUser(decoded);
                }}
                onError={() => console.log('Login Failed')}
                useOneTap
              />
            )}
          </div>
        </header>

        {/* Main Full-Screen Workspace */}
        <main className="flex-1 w-full flex flex-col relative pb-12">
          
          {/* Subheader Switcher: Dedicated Mode Selection Tabs */}
          <div className="w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 z-20">
            <button
              onClick={() => {
                setSearchMode('diy');
                setScrapedData(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                searchMode === 'diy'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Hammer className="w-4 h-4" /> Build DIY Trip (Flights + Hotels + Cabs)
            </button>
            <button
              onClick={() => {
                setSearchMode('tours');
                setScrapedData(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                searchMode === 'tours'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" /> Pre-made Tour Packages
            </button>
          </div>

          {/* Dynamic Search Widget Controller Wrapper */}
          <div className="w-full z-20 shadow-sm relative bg-white">
            {searchMode === 'diy' ? (
              /* Render customized Multi-Segment Assembly inputs */
              <DIYSearchForm 
                onDataScraped={(data) => {
                  setScrapedData(data);
                  setIsSearching(false);
                }}
                onSearchStart={() => {
                  setIsSearching(true);
                }}
              />
            ) : (
              /* Render Dedicated Pre-Made Tours Form */
              <TourSearchForm 
                onDataScraped={(data) => {
                  setScrapedData(data);
                  setIsSearching(false);
                }} 
                onSearchStart={() => {
                  setIsSearching(true);
                }} 
              />
            )}
          </div>

          {/* Dynamic Progress Loader or Results Panel Frame */}
          <div className="w-full flex-1 px-4 lg:px-8 pt-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <div className="relative flex items-center justify-center mb-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Sparkles className="w-5 h-5 text-indigo-600 absolute animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Deploying Matrix Scrapers...</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">
                    Gemini is currently compiling packages and routes matching your constraints.
                  </p>
                </div>
              ) : (
                <LiveComparisonDashboard data={scrapedData} searchMode={searchMode} />
              )}
            </div>
          </div>
        </main>
      </div>
    </GoogleOAuthProvider>
  );
}