"use client";   // It is required to enable interactions—such as clicks and input—in Next.js.

import { useState } from 'react';
import Badge from '../components/Badge';
import Card from '../components/Card'; 

export default function Dashboard() {
  // 1. State Management (React State)
  const [searchQuery, setSearchQuery] = useState("");  // Save Search Term
  const [commuteMode, setCommuteMode] = useState("CAR");  // Current Mode (Car or MARTA)

  // 2. Placeholder Data: Dummy data used until the actual API connection is established.
  const parkingDecks = [
    { name: "T Deck", status: "Full", location: "43 Gilmer St SE" },
    { name: "M Deck", status: "Open", location: "33 Auburn Ave" },
    { name: "G Deck", status: "Limited", location: "121 Collins St" },
    { name: "S Deck", status: "Limited", location: "Near Petite Science Center" },
    { name: "CC Deck", status: "Open", location: "Campus Center" }
  ];

  const martaStations = [
    { name: "Five Points", status: "Arriving", location: "Northbound - 9 min" },
    { name: "Georgia State", status: "Open", location: "Eastbound - 5 min" },
    { name: "Peachtree Center", status: "Delayed", location: "Southbound - 15 min" }
  ];

  const martaAlerts = [
    { line: "Blue Line", msg: "15 min delay eastbound", type: "delay" },
    { line: "Bus Route 89", msg: "Minor detour near Five Points", type: "detour" }
  ];

  // 3. Search Filtering Logic: Selects only the data containing the characters entered by the user.
  const filteredDecks = parkingDecks.filter(deck => 
    deck.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStations = martaStations.filter(station => 
    station.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 4. Directions Function: Clicking this links to Google Maps.
  const handleDirections = (dest: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest + " Georgia State University")}`, '_blank');
  };

  return (
    <main className="flex h-screen w-full bg-[#FDFCF7] font-sans overflow-hidden text-slate-900">
      
      {/* Left: Sidebar Section */}
      <section className="w-[420px] bg-white border-r border-slate-200 shadow-xl flex flex-col z-30 overflow-hidden">
        
        {/* App Logo Header Area */}
        <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-br-[40px] shadow-lg">
          <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2 italic">
            <span className="opacity-50 font-light">[</span> 
            GSU COMMUTER 
            <span className="opacity-50 font-light">]</span>
          </h1>
          <p className="text-[10px] font-bold opacity-70 mt-1 ml-4 tracking-[0.2em]">SMART CAMPUS NAVIGATION</p>
        </div>

        {/* Search Bar Area */}
        <div className="px-8 py-6 border-b border-slate-100 bg-[#F9F7F0]/50">
          <div className="relative w-full">
            <input 
              type="text"
              placeholder="Search for parking or stations..."
              className="w-full pl-6 pr-12 py-3.5 bg-[#FDFCF7] border-2 border-slate-200 focus:border-blue-300 rounded-xl text-sm transition-all outline-none shadow-inner box-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)' }}
              className="text-slate-400 text-lg pointer-events-none">⌖</span>
          </div>
        </div>

        {/* List Output Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {/* Display parking list in Car Mode. */}
          {commuteMode === "CAR" ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center justify-between mt-8 mb-4 px-10">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Live Parking</h2>
                <span className="text-[10px] bg-green-100 text-green-600 px-2.5 py-1 rounded-full font-black">LIVE UPDATE</span>
              </div>
              
              <div className="flex flex-col border-t border-slate-100">
                {filteredDecks.map((deck) => (
                  <Card 
                    key={deck.name} 
                    title={deck.name}
                    subtitle={deck.location}
                    status={deck.status}
                    onClick={() => handleDirections(deck.location)}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Display station information and alerts when in MARTA mode. */
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mt-8 mb-4 px-10">Nearby Stations</h2>
              <div className="flex flex-col border-t border-slate-100 mb-10">
                {filteredStations.map((station) => (
                  <Card 
                    key={station.name} 
                    title={station.name}
                    subtitle={station.location}
                    status={station.status}
                    onClick={() => handleDirections(station.name)}
                  />
                ))}
              </div>

              {/* Rendering MARTA Delay Alerts */}
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-10">System Alerts</h2>
              <div className="flex flex-col border-t border-slate-100">
                {martaAlerts.map((alert, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      backgroundColor: alert.type === 'delay' ? '#FFF1F2' : '#FFFBEB',
                      borderLeft: alert.type === 'delay' ? '5px solid #F43F5E' : '5px solid #F59E0B'
                    }}
                    className="w-full py-7 px-10 flex flex-col border-b border-white/50 box-border"
                  >
                    <div className="flex flex-col text-left">
                      <p className={`text-xl font-black tracking-tighter mb-1.5 ${alert.type === 'delay' ? 'text-rose-700' : 'text-amber-800'}`}>
                        {alert.line}
                      </p>
                      <p className="text-[13px] text-slate-600 font-semibold leading-relaxed opacity-90">
                        {alert.msg}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Button: Get Directions to School */}
        <div className="p-6 bg-[#F9F7F0]/80 border-t border-slate-100">
          <button 
            onClick={() => handleDirections("GSU Campus")} 
            className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-bold shadow-xl hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <span>🧭</span> Get Directions to Campus
          </button>
        </div>
      </section>

      {/* Right: Map Area (The space where map components will be placed) */}
      <section className="flex-1 relative bg-[#FDFCF7]">
        {/* Top mode switch button (CAR / MARTA) */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-3 z-20 bg-white/40 p-1.5 backdrop-blur-md rounded-full shadow-lg border border-white/20">
          <button 
            onClick={() => setCommuteMode("CAR")}
            style={{ 
              backgroundColor: commuteMode === "CAR" ? "#BFA892" : "transparent",
              color: commuteMode === "CAR" ? "white" : "#737368",
              borderColor: commuteMode === "CAR" ? "#4c4c45" : "transparent"
            }}
             className={`px-12 py-3 rounded-full text-xs font-black transition-all border-2 ${commuteMode === "CAR" ? "shadow-md" : ""}`}
          >
             CAR
          </button>

          <button 
            onClick={() => setCommuteMode("MARTA")}
            style={{ 
              backgroundColor: commuteMode === "MARTA" ? "#BFA892" : "transparent",
              color: commuteMode === "MARTA" ? "white" : "#737368",
              borderColor: commuteMode === "MARTA" ? "#4c4c45" : "transparent"
            }}
            className={`px-12 py-3 rounded-full text-xs font-black transition-all border-2 ${commuteMode === "MARTA" ? "shadow-md" : ""}`}
          >
             MARTA
          </button>
        </div>

        {/* Map Loading Indicator (Actual Map) */}
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-32 h-32 border-8 border-blue-50 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl animate-bounce">📍</span>
          </div>
          <div className="mt-10 text-center">
            <h3 className="text-2xl font-black text-slate-800">Map Interface Loading</h3>
            <p className="text-slate-400 mt-2 font-medium">Waiting for CampusMap Component...</p>
          </div>
        </div>
      </section>
    </main>
  );
}