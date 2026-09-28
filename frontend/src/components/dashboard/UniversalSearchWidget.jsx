import React, { useState } from 'react';
import { 
  MapPin, Calendar, Search, Plane, Train, 
  Bus, Car, Building, Users, Loader2, Compass, Briefcase
} from 'lucide-react';

export default function UniversalSearchWidget({ onDataScraped, onSearchModeChange }) {
  const [bookingType, setBookingType] = useState('diy');
  
  const [activeMode, setActiveMode] = useState('flights');
  const [origin, setOrigin] = useState('BLR');
  const [destination, setDestination] = useState('DEL');
  
  const [hotelCity, setHotelCity] = useState('Manali');
  const [guests, setGuests] = useState(2);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  
  const [startDate, setStartDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(dayAfter.toISOString().split('T')[0]);

  const [isSearching, setIsSearching] = useState(false);
  const [statusText, setStatusText] = useState('');

  const searchModes = [
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'hotels', label: 'Hotels', icon: Building },
    { id: 'trains', label: 'Trains', icon: Train },
    { id: 'buses', label: 'Buses', icon: Bus },
    { id: 'cabs', label: 'Cabs', icon: Car },
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    onDataScraped(null); 

    if (onSearchModeChange) {
      onSearchModeChange(bookingType);
    }

    try {
      let queryParams = "";
      
      if (bookingType === 'tours') {
        setStatusText("Deploying parallel scrapers across custom tour packages...");
        queryParams = `mode=tours&destination=${encodeURIComponent(destination)}&date=${startDate}&guests=${guests}`;
      } else {
        setStatusText(`Searching live aggregators for ${activeMode}...`);
        queryParams = activeMode === 'hotels' 
          ? `mode=${activeMode}&city=${encodeURIComponent(hotelCity)}&checkin=${startDate}&checkout=${endDate}&guests=${guests}`
          : `mode=${activeMode}&origin=${origin}&destination=${destination}&date=${startDate}`;
      }

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      // 1. ADDED NGROK BYPASS HEADERS HERE
      const scrapeResponse = await fetch(`${API_BASE}/api/scrape/trigger-search?${queryParams}`, { 
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true" 
        }
      });
      
      const taskData = await scrapeResponse.json();

      const checkStatus = setInterval(async () => {
        try {
          // 2. ADDED NGROK BYPASS HEADERS HERE
          const statusRes = await fetch(`${API_BASE}/api/scrape/status/${taskData.task_id}`, {
            headers: {
              "ngrok-skip-browser-warning": "true"
            }
          });
          const statusData = await statusRes.json();
          
          if (statusData.status === "completed") {
            clearInterval(checkStatus); 
            const parsedData = typeof statusData.data === 'string' ? JSON.parse(statusData.data) : statusData.data;
            onDataScraped(parsedData);
            setIsSearching(false);
            setStatusText('');
          } else if (statusData.status === "failed") {
            clearInterval(checkStatus);
            setIsSearching(false);
            setStatusText('Scraper cluster encountered an issue. Please retry.');
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
      
    } catch (error) {
      console.error("Backend connection failure:", error);
      setIsSearching(false);
      setStatusText('Backend engine offline.');
    }
  };

  return (
    <div className="bg-white border-b border-gray-100 flex-shrink-0 z-20 shadow-sm relative pt-4 pb-6 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Core Architectural Switcher */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-100 p-1 rounded-xl inline-flex shadow-inner">
            <button
              type="button"
              onClick={() => setBookingType('diy')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                bookingType === 'diy' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              Build DIY Trip
            </button>
            <button
              type="button"
              onClick={() => setBookingType('tours')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                bookingType === 'tours' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Pre-made Tour Packages
            </button>
          </div>
        </div>
        
        {/* Sub-Tabs for DIY Category Segments */}
        {bookingType === 'diy' && (
          <div className="flex items-center gap-1 mb-6 border-b border-slate-100 pb-4 overflow-x-auto whitespace-nowrap">
            {searchModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setActiveMode(mode.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                    isActive 
                    ? 'bg-indigo-50 text-indigo-700 shadow-[inset_0_0_0_1px_rgba(79,70,229,0.2)]' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {mode.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Search Context Area */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
          
          {bookingType === 'tours' ? (
            <>
              {/* Pre-made Tours View Model */}
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Target Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 font-semibold focus:bg-white focus:border-indigo-500 transition-all outline-none"
                    placeholder="e.g., Goa, Kashmir, Bali"
                  />
                </div>
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Travelers</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="number" 
                    min="1"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 font-semibold focus:bg-white focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>
            </>
          ) : activeMode === 'hotels' ? (
            <>
              {/* Accommodation View Model */}
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City or Property</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={hotelCity}
                    onChange={(e) => setHotelCity(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 font-semibold focus:bg-white focus:border-indigo-500 transition-all outline-none"
                    placeholder="e.g. Manali"
                  />
                </div>
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Guests</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="number" 
                    min="1"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 font-semibold focus:bg-white focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Transport Split Terminal View Model */}
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 font-semibold uppercase focus:bg-white focus:border-indigo-500 transition-all outline-none"
                    placeholder="e.g. BLR"
                  />
                </div>
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 font-semibold uppercase focus:bg-white focus:border-indigo-500 transition-all outline-none"
                    placeholder="e.g. DEL"
                  />
                </div>
              </div>
            </>
          )}

          {/* Temporal Boundaries Processing */}
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {activeMode === 'hotels' && bookingType === 'diy' ? 'Check-in' : 'Departure Date'}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 font-semibold focus:bg-white focus:border-indigo-500 transition-all outline-none"
              />
            </div>
          </div>

          {activeMode === 'hotels' && bookingType === 'diy' && (
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Check-out</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 font-semibold focus:bg-white focus:border-indigo-500 transition-all outline-none"
                />
              </div>
            </div>
          )}

          {/* Core Dispatch Execution Action */}
          <button 
            type="submit" 
            disabled={isSearching}
            className="w-full md:w-auto bg-indigo-600 text-white rounded-xl py-3 px-8 font-bold hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors flex items-center justify-center gap-2 h-[50px]"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            <span className="hidden lg:inline">Search</span>
          </button>
        </form>
        
        {/* Status Updates Notification Ribbon */}
        {statusText && (
          <p className="text-center text-sm font-medium text-indigo-600 mt-4 animate-pulse">
            {statusText}
          </p>
        )}
      </div>
    </div>
  );
}