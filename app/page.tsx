"use client";

import { useState } from 'react';
import Badge from '../components/Badge';
import Card from '../components/Card'; 

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [commuteMode, setCommuteMode] = useState("CAR");

  const parkingDecks = [
    { name: "T Deck", status: "Full", location: "43 Gilmer St SE" },
    { name: "M Deck", status: "Open", location: "33 Auburn Ave" },
    { name: "G Deck", status: "Limited", location: "121 Collins St" },
    { name: "S Deck", status: "Limited", location: "Near Petite Science Center" },
    { name: "CC Deck", status: "Open", location: "Campus Center" }
  ];

  const martaAlerts = [
    { line: "Blue Line", msg: "15 min delay eastbound", type: "delay" },
    { line: "Bus Route 89", msg: "Minor detour near Five Points", type: "detour" }
  ];

  const filteredDecks = parkingDecks.filter(deck => 
    deck.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDirections = (dest: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest + " Georgia State University")}`, '_blank');
  };

  return (
    <main className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden text-slate-900">
      
      {/* 1. Sidebar: Convert Live Status feature to web layout  */}
      <section className="w-[400px] bg-white border-r border-slate-200 shadow-2xl flex flex-col z-30">
        
        {/* Header Section */}
        <div className="p-8 bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-md">
          <h1 className="text-3xl font-black tracking-tighter mb-1">GSU COMMUTER</h1>
          <p className="text-xs font-medium opacity-70 tracking-wide uppercase">Smart Campus Navigation</p>
        </div>

        {/*  1) Search bar: Filtering system */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="relative flex items-center w-full">            
            <input 
              type="text"
              placeholder="Search Parking or Stations..."
              className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span 
              style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)' }}
              className="text-slate-400 text-lg pointer-events-none">🔍</span>

          </div>
        </div>

        {/* List Section */}
        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          <div className="p-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Live Status</h2>
            
            <div className="space-y-3">
              {commuteMode === "CAR" ? (
                filteredDecks.map((deck) => (
                  <Card 
                    key={deck.name} 
                    title={deck.name}
                    subtitle={deck.location}
                    status={deck.status}
                    onClick={() => handleDirections(deck.location)}
                  />
                ))
              ) : (
                <div className="px-4 py-20 text-center text-slate-400">
                  <p className="text-sm font-medium italic italic">Connecting to MARTA Live Feed...</p>
                </div>
              )}
            </div>
          </div>

          {/* System Alerts */}
          <div className="p-2 mt-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">System Alerts</h2>
            {martaAlerts.map((alert, i) => (
              <div key={i} className="mb-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 items-start shadow-sm text-slate-800">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="text-sm font-bold text-amber-900">{alert.line}</p>
                  <p className="text-xs text-amber-700 leading-relaxed mt-1">{alert.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Button */}
        <div className="p-6 border-t border-slate-100 bg-white">
          <button 
            onClick={() => handleDirections("GSU Campus")} 
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>🧭</span> Get Directions to Campus
          </button>
        </div>
      </section>

      {/* 2. Main Area (Map) */}
      <section className="flex-1 relative bg-slate-100">
        {/* Mode Selector */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex bg-white/80 backdrop-blur-xl p-1.5 rounded-[20px] shadow-2xl border border-white/50 z-20">
          <button 
            onClick={() => setCommuteMode("CAR")}
            className={`px-10 py-3 rounded-[15px] text-sm font-bold transition-all ${commuteMode === "CAR" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            CAR
          </button>
          <button 
            onClick={() => setCommuteMode("MARTA")}
            className={`px-10 py-3 rounded-[15px] text-sm font-bold transition-all ${commuteMode === "MARTA" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            MARTA
          </button>
        </div>

        {/* Placeholder */}
        <div className="w-full h-full flex flex-col items-center justify-center">
           <div className="relative">
             <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
             <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl">📍</span>
           </div>
           <div className="mt-8 text-center text-slate-800">
              <h3 className="text-xl font-bold">Map Interface Loading</h3>
              <p className="text-slate-500 mt-2 font-medium">Waiting for CampusMap Component...</p>
           </div>
        </div>
      </section>

    </main>
  );
}