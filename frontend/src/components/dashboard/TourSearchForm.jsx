import React, { useState } from 'react';
import { MapPin, Search, Calendar, Users } from 'lucide-react';

export default function TourSearchForm({ onDataScraped, onSearchStart }) {
  const [formData, setFormData] = useState({
    destination: '',
    date: '',
    guests: '2'
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!formData.destination || !formData.date) return;
    
    if (onSearchStart) onSearchStart();

    try {
      const queryParams = new URLSearchParams({
        mode: 'tours',
        destination: formData.destination,
        date: formData.date,
        guests: formData.guests
      });

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      // Trigger the Celery Master Task (WITH NGROK BYPASS HEADERS IF APPLICABLE)
      const triggerRes = await fetch(`${API_BASE}/api/scrape/trigger-search?${queryParams.toString()}`, { 
        method: 'POST',
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });
      
      const triggerData = await triggerRes.json();
      if (triggerData.error) throw new Error(triggerData.error);

      const taskId = triggerData.task_id;

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
            let parsedData = statusData.data;
            if (typeof parsedData === 'string') {
              try { parsedData = JSON.parse(parsedData); } 
              catch(e) { console.error("Parse error:", e); }
            }
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
      console.error("Search failed:", error);
      if (onDataScraped) onDataScraped({ error: true, status: 'failed' });
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-6xl mx-auto bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-sm mb-8 relative z-10">
      <div className="flex items-center mb-6">
        <span className="bg-fuchsia-100 text-fuchsia-700 text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg">
          Pre-Made Tour Packages
        </span>
        <span className="text-sm font-medium text-gray-500 ml-4 hidden sm:block">
          Discover expertly crafted, all-inclusive holiday itineraries.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <label className="text-xs font-bold text-gray-500 mb-1 block ml-1">DESTINATION</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fuchsia-500" />
            <input 
              type="text" 
              placeholder="e.g. Goa, Kashmir, Kerala"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 outline-none font-medium"
              value={formData.destination}
              onChange={(e) => setFormData({...formData, destination: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <label className="text-xs font-bold text-gray-500 mb-1 block ml-1">STARTING DATE</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="date" 
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 outline-none font-medium text-gray-700"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <label className="text-xs font-bold text-gray-500 mb-1 block ml-1">TRAVELERS</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select 
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 outline-none font-medium appearance-none"
              value={formData.guests}
              onChange={(e) => setFormData({...formData, guests: e.target.value})}
            >
              <option value="1">1 Traveler (Solo)</option>
              <option value="2">2 Travelers (Couple)</option>
              <option value="4">4 Travelers (Family)</option>
              <option value="6">6+ Travelers (Group)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button 
          type="submit"
          className="bg-gray-900 hover:bg-fuchsia-600 text-white font-bold text-sm px-8 py-4 rounded-xl flex items-center transition-colors shadow-md"
        >
          <Search className="w-5 h-5 mr-2" />
          Find Packages
        </button>
      </div>
    </form>
  );
}