import { create } from 'zustand';

const useTripStore = create((set) => ({
  // Chat State
  messages: [
    { role: 'assistant', text: 'Namaskara! I am your AI Travel Co-Pilot. Where are we heading in India today?' }
  ],
  
  // Dashboard & Scraper State
  isScraping: false,
  tourPackages: [],
  diyOptions: { flights: [], hotels: [] },

  // Actions
  addUserMessage: (text) => set((state) => ({ 
    messages: [...state.messages, { role: 'user', text }] 
  })),
  
  addBotMessage: (text) => set((state) => ({ 
    messages: [...state.messages, { role: 'assistant', text }] 
  })),

  setScrapingStatus: (status) => set({ isScraping: status }),
  
  updateDashboardData: (tours, diy) => set({ 
    tourPackages: tours, 
    diyOptions: diy,
    isScraping: false 
  })
}));

export default useTripStore;