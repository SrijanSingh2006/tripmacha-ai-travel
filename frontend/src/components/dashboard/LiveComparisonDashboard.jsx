import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, Navigation, AlertTriangle, ChevronDown, ChevronUp, DollarSign, Calendar } from 'lucide-react';

export default function LiveComparisonDashboard({ data, searchMode }) {
  const [expandedRow, setExpandedRow] = useState(null);

  // STATE 1: ERROR HANDLING
  if (data && (data.error || data.status === "failed")) {
    return (
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-rose-50/60 p-10 rounded-3xl border border-rose-100 flex flex-col items-center justify-center text-center min-h-[300px] shadow-sm">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-rose-900 tracking-tight">AI Pipeline Busy</h3>
          <p className="text-sm text-rose-600 mt-2 max-w-md leading-relaxed font-medium">
            The processing model is experiencing temporary global request spikes. 
            Your scraper data is secure—simply wait 5 seconds and press search again to clear the buffer!
          </p>
        </div>
      </div>
    );
  }

  // Raw extracted list matching either key format
  const rawDeals = data ? (data.flights || data.deals || []) : null;

  // --- HELPER: PRICE PARSER FOR SORTING ---
  const parsePrice = (priceStr) => {
    if (!priceStr) return Infinity;
    // Strip everything except numeric digits
    const numeric = parseInt(priceStr.toString().replace(/[^\d]/g, ''), 10);
    return isNaN(numeric) ? Infinity : numeric;
  };

  // --- AUTOMATIC ASCENDING SORTING & CLEANING ---
  const sortedDeals = rawDeals
    ? [...rawDeals].sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
    : null;

  // STATE 2: WAITING FOR AI / LOADING
  if (!data || !sortedDeals) {
    return (
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Dashboard</h1>
            <p className="text-gray-500 mt-1">Live results will appear here based on your search.</p>
          </div>
          <div className="flex items-center text-sm font-medium text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200 shadow-sm">
            <span className="flex h-2.5 w-2.5 relative mr-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Scrapers Active
          </div>
        </div>

        <div className="flex justify-center w-full mt-4">
          <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[250px] text-center w-full max-w-md animate-in zoom-in-95 duration-500">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${searchMode === 'diy' ? 'bg-indigo-50 text-indigo-600' : 'bg-fuchsia-50 text-fuchsia-600'}`}>
              <RefreshCw className="w-8 h-8 animate-spin-slow" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              {searchMode === 'diy' ? 'Scraping DIY Options' : 'Compiling Tour Packages'}
            </h3>
            <p className="text-sm text-gray-500 mt-3 max-w-xs">
              {searchMode === 'diy' 
                ? 'Assembling custom flights, hotels, and rentals matching your timeline...' 
                : 'Scanning local operators for complete bundled vacation packages...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // STATE 3: DATA READY
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest px-2.5 py-1 bg-indigo-50 rounded-md border border-indigo-100">
            {searchMode === 'diy' ? 'Custom DIY Build' : 'Fixed Tour Packages'}
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-2">
            Explore {data.destination || 'Selected Route'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Showing options auto-sorted by **lowest price** matching your criteria.
          </p>
        </div>

        {/* METRICS CAPSULES */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center text-xs font-semibold text-gray-700 bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-sm">
            <Calendar className="w-3.5 h-3.5 mr-2 text-indigo-500" />
            Sorted Ascending
          </div>
          <div className="flex items-center text-sm font-medium text-indigo-700 bg-indigo-50/80 px-4 py-2 rounded-full border border-indigo-100 shadow-sm">
            <CheckCircle2 className="w-4 h-4 mr-2 text-indigo-500" />
            Parsing Optimized
          </div>
        </div>
      </div>

      {/* RENDER LISTINGS */}
      <div className="space-y-4 border-t border-gray-100 pt-4">
        {sortedDeals.length === 0 ? (
           <div className="p-12 bg-white rounded-2xl border border-gray-200 shadow-sm text-center text-gray-500">
             No matching itineraries or flight combinations found within budget thresholds.
           </div>
        ) : (
          sortedDeals.map((item, idx) => {
            
            // --- BULLETPROOF ITINERARY PARSING ---
            // Handles cases where Gemini returns an array, a single string, or undefined
            let cleanItinerary = [];
            if (Array.isArray(item.itinerary)) {
              cleanItinerary = item.itinerary;
            } else if (typeof item.itinerary === 'string' && item.itinerary.trim().length > 0) {
              cleanItinerary = item.itinerary.split(/[,\n|]+/).map(str => str.trim());
            }
            
            const hasItineraryData = cleanItinerary.length > 0;
            const isExpanded = expandedRow === idx;

            return (
              <div 
                key={idx} 
                className={`bg-white border ${isExpanded ? 'border-indigo-400 ring-4 ring-indigo-50' : 'border-gray-200'} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 group ${hasItineraryData ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (hasItineraryData) {
                    setExpandedRow(isExpanded ? null : idx);
                  }
                }}
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-5 flex-1">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
                      <Navigation className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-800 bg-indigo-50/80 px-2.5 py-1 rounded-md border border-indigo-100">
                          {item.airline || "Provider / Operator"}
                        </span>
                        
                        {/* DIY Context Pill */}
                        {searchMode === 'diy' && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            DIY Dynamic Fit
                          </span>
                        )}
                      </div>
                      
                      <h4 className="text-lg font-bold text-gray-900 pt-1">
                        {item.departure_time || "Duration Info Unavailable"}
                      </h4>
                      <p className="text-sm text-gray-500 font-medium">
                        {item.arrival_time || "Inclusions Summary"}
                      </p>
                    </div>
                  </div>
                  
                  {/* PRICING & ACTION CORNER */}
                  <div className="sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-gray-900 tracking-tight">
                        {item.price || "₹--"}
                      </span>
                      {hasItineraryData && (
                        <div className="sm:hidden text-gray-400">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 mt-0 sm:mt-3">
                      {hasItineraryData && (
                        <span className="hidden sm:flex text-xs font-bold text-indigo-600 items-center gap-1">
                          {isExpanded ? 'Hide Details' : 'View Highlights'} {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </span>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); 
                          const searchTerms = `${item.airline || ''} travel ${data.destination || ''}`;
                          window.open(`https://www.google.com/search?q=${encodeURIComponent(searchTerms)}`, '_blank');
                        }}
                        className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-colors cursor-pointer shadow-sm"
                      >
                        View Deal
                      </button>
                    </div>
                  </div>
                </div>

                {/* EXPANDABLE DRAWER: VISUALIZED HIGHLIGHTS / ITINERARY */}
                {isExpanded && hasItineraryData && (
                  <div className="mt-6 pt-5 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                      {searchMode === 'diy' ? 'Dynamic Trip Components' : 'Package Breakdowns'}
                    </h5>
                    <ul className="space-y-3">
                      {cleanItinerary.map((dayPlan, i) => (
                        <li key={i} className="flex gap-4 items-start">
                          <div className="flex flex-col items-center mt-0.5">
                            <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0 border border-indigo-100">
                              {i + 1}
                            </div>
                            {i !== cleanItinerary.length - 1 && (
                              <div className="w-0.5 h-5 bg-slate-100 mt-1"></div>
                            )}
                          </div>
                          <div className="text-sm text-gray-700 leading-relaxed font-medium">
                            {dayPlan}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}