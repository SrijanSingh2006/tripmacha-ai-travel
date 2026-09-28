import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import HybridPlanner from './pages/HybridPlanner';

export default function App() {
  const [activeWorkspace, setActiveWorkspace] = useState(false);

  return (
    <main className="w-full min-h-screen bg-slate-50 overflow-x-hidden">
      {activeWorkspace ? (
        <HybridPlanner />
      ) : (
        <LandingPage onStart={() => setActiveWorkspace(true)} />
      )}
    </main>
  );
}