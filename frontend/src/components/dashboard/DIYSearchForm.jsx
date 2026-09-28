import React, { useState } from 'react';
import { MapPin, CalendarClock, Wallet, Search, Calendar } from 'lucide-react';

// Notice we are now accepting the exact props HybridPlanner is passing down!
export default function DIYSearchForm({ onDataScraped, onSearchStart }) {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: '', // Added Date!
    duration: '3', 
    budget: 'moderate' 
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!formData.origin || !formData.destination || !formData.date) return;
    
    // 1. Tell HybridPlanner to show the loading spinner
    if (onSearchStart) onSearchStart();

    try {
      // 2. Build the query URL for FastAPI
      const queryParams = new URLSearchParams({
        mode: 'diy',
        origin: formData.origin,
        destination: formData.destination,
        date: formData.date,
        duration: formData.duration,
        budget: formData.budget
      });

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      // 3. Trigger the Celery Master Task (WITH NGROK BYPASS HEADERS IF APPLICABLE)
      const triggerRes = await fetch(`${API_BASE}/api/scrape/trigger-search?${queryParams.toString()}`, { 
        method: 'POST',
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });
      
      const triggerData = await triggerRes.json();
      if (triggerData.error) throw new Error(triggerData.error);

      const taskId = triggerData.task_id;

      // 4. Poll the backend every 3 seconds until AI finishes building the package
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${API_BASE}/api/scrape/status/${taskId}`, {
            headers: {
              "ngrok-skip-browser-warning": "true"
            }
          });
          const statusData = await statusRes.json();

          if (statusData.status === 'completed') {
            clearInterval(pollInterval);
            
            // Parse the JSON string from AI into a real JS object
            let parsedData = statusData.data;
            if (typeof parsedData === 'string') {
              try {
                parsedData = JSON.parse(parsedData);
              } catch(e) {
                console.error("Failed to parse AI JSON:", e);
              }
            }
            
            // 5. Send the finished data back up to the Dashboard
            if (onDataScraped) onDataScraped(parsedData);
            
          } else if (statusData.status === 'failed') {
            clearInterval(pollInterval);
            if (onDataScraped) onDataScraped({ error: true, status: 'failed' });
          }
        } catch (pollError) {
          console.error("Polling error:", pollError);
        }
      }, 3000);

    } catch (error) {
      console.error("Search trigger failed:", error);
      if (onDataScraped) onDataScraped({ error: true, status: 'failed' });
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-6xl mx-auto bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-sm mb-8 relative z-10">
      <div className="flex items-center mb-6">
        <span className="bg-indigo-100 text-indigo-700 text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg">
          DIY Trip Builder
        </span>
        <span className="text-sm font-medium text-gray-500 ml-4 hidden sm:block">
          Tell the AI what you want, and it will assemble the perfect pieces.
        </span>
      </div>

      {/* TOP ROW: Places & Dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <label className="text-xs font-bold text-gray-500 mb-1 block ml-1">LEAVING FROM</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="e.g. Bengaluru"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              value={formData.origin}
              onChange={(e) => setFormData({...formData, origin: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <label className="text-xs font-bold text-gray-500 mb-1 block ml-1">GOING TO</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
            <input 
              type="text" 
              placeholder="e.g. Manali"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              value={formData.destination}
              onChange={(e) => setFormData({...formData, destination: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <label className="text-xs font-bold text-gray-500 mb-1 block ml-1">START DATE</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="date" 
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-700"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Constraints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <label className="text-xs font-bold text-gray-500 mb-1 block ml-1">DURATION</label>
          <div className="relative">
            <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select 
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium appearance-none"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
            >
              <option value="2">2 Days (Weekend)</option>
              <option value="3">3 Days (Short Trip)</option>
              <option value="5">5 Days (Standard)</option>
              <option value="7">7 Days (Full Week)</option>
              <option value="10">10+ Days (Extended)</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <label className="text-xs font-bold text-gray-500 mb-1 block ml-1">BUDGET TIER</label>
          <div className="relative">
            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
            <select 
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium appearance-none"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
            >
              <option value="shoestring">Shoestring (Backpacker)</option>
              <option value="moderate">Moderate (Standard)</option>
              <option value="premium">Premium (4-Star+)</option>
              <option value="luxury">Luxury (No Limit)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button 
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-8 py-4 rounded-xl flex items-center transition-colors shadow-md"
        >
          <Search className="w-5 h-5 mr-2" />
          Assemble My Trip
        </button>
      </div>
    </form>
  );
}