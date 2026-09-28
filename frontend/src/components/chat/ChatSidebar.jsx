import React, { useState } from 'react';
import { Send, Map, Calendar, Plane, Sparkles } from 'lucide-react';

// 1. Added the onDataScraped prop so it can send data to the parent!
export default function ChatSidebar({ onDataScraped }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Namaskara! I am your AI Travel Co-Pilot. Where are we heading in India today?' }
  ]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input;
    
    // Instantly show user message
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    
    // Add temporary loading bubble
    setMessages(prev => [...prev, { role: 'assistant', text: 'Processing your request...' }]);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      // Connect to the FastAPI Chat Router
      const chatResponse = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage, history: messages })
      });
      
      const chatData = await chatResponse.json();
      
      // Update the message bubble with the structured chat itinerary reply from the AI
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', text: chatData.chat_reply || 'Scanning live travel options now...' };
        return updated;
      });

      // Trigger the background Scraper Array using AI-extracted parameters
      console.log(`Forwarding extracted intent to scraper: ${chatData.airport_code} for date ${chatData.search_date}`);
      const scrapeResponse = await fetch(`${API_BASE}/api/scrape/trigger-flight-search?destination=${encodeURIComponent(chatData.airport_code)}&date=${encodeURIComponent(chatData.search_date)}`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      const taskData = await scrapeResponse.json();
      console.log("Background Scraper Task ID:", taskData.task_id);

      // THE POLLING LOOP (Checks the backend every 3 seconds)
      const checkStatus = setInterval(async () => {
        try {
          const statusRes = await fetch(`${API_BASE}/api/scrape/status/${taskData.task_id}`);
          const statusData = await statusRes.json();
          
          if (statusData.status === "completed") {
            // STOP the loop! The data is ready.
            clearInterval(checkStatus); 
            console.log("Scraping finished!", statusData.data);
            
            // 2. THIS IS THE MAGIC BRIDGE! Push the data up to HybridPlanner
            if (onDataScraped) {
                // Ensure it's passed as a clean Javascript Object, not a raw JSON string
                const parsedData = typeof statusData.data === 'string' ? JSON.parse(statusData.data) : statusData.data;
                onDataScraped(parsedData);
            }
            
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              text: 'Scraping complete! Check the dashboard on the right for your live prices.' 
            }]);
            
          } else if (statusData.status === "failed") {
            // STOP the loop! Something broke in Celery.
            clearInterval(checkStatus);
            console.error("Scraper crashed:", statusData.error);
            
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              text: 'Looks like the scraper ran into an issue connecting to the airlines. Please try again.' 
            }]);
          }
        } catch (err) {
          console.error("Polling connection error:", err);
        }
      }, 3000); // 3000ms = 3 seconds
      
    } catch (error) {
      console.error("Backend offline:", error);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', text: 'Connected locally, but cannot reach the AI brain. Ensure the FastAPI Backend terminal is running!' };
        return updated;
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      
      {/* Sidebar Header */}
      <div className="p-5 border-b border-gray-100 bg-indigo-600 text-white flex items-center gap-3 flex-shrink-0">
        <div className="bg-white/10 p-2 rounded-xl">
          <Plane className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-base leading-tight">TripMacha Co-Pilot</h2>
          <p className="text-xs text-indigo-200 flex items-center gap-1 mt-0.5">
            <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" /> Powered by Gemini
          </p>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
              }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Suggestions */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto whitespace-nowrap border-t border-gray-100 bg-white flex-shrink-0">
        <button 
          onClick={() => setInput('Manali under ₹15k')}
          className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-full px-3.5 py-2 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 flex items-center gap-1.5 text-gray-600 transition-all cursor-pointer"
        >
          <Map className="w-3 h-3 text-slate-400" /> Manali under ₹15k
        </button>
        <button 
          onClick={() => setInput('Weekend in Goa')}
          className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-full px-3.5 py-2 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 flex items-center gap-1.5 text-gray-600 transition-all cursor-pointer"
        >
          <Calendar className="w-3 h-3 text-slate-400" /> Weekend in Goa
        </button>
      </div>

      {/* Input Tray */}
      <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Where should we search today?" 
            className="w-full bg-slate-100 border border-transparent rounded-xl py-3.5 pl-4 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}