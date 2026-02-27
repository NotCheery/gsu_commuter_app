"use client";

import { useState } from 'react';
import Badge from '../components/Badge';
import Card from '../components/Card'; 

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [commuteMode, setCommuteMode] = useState("CAR");

  // Placeholder Data
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

  const filteredDecks = parkingDecks.filter(deck => 
    deck.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStations = martaStations.filter(station => 
    station.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDirections = (dest: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest + " Georgia State University")}`, '_blank');
  };

  return (
    <main className="flex h-screen w-full bg-[#F8FAFC] font-sans overflow-hidden text-slate-900">
      
      {/* 1. Sidebar */}
      <section className="w-[420px] bg-white border-r border-slate-200 shadow-xl flex flex-col z-30 overflow-hidden">
        
        {/* Header Section */}
        <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-br-[40px] shadow-lg">
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span>🔹</span> GSU COMMUTER <span>🔹</span>
          </h1>
          <p className="text-xs font-medium opacity-80 mt-1 ml-7 tracking-wide">SMART CAMPUS NAVIGATION</p>
        </div>

        {/* Search Bar */}
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <div className="relative w-full">
            <input 
              type="text"
              placeholder="Search for parking or stations..."
              className="w-full pl-6 pr-12 py-3.5 bg-white border-2 border-slate-200 focus:border-blue-400 rounded-xl text-sm transition-all outline-none shadow-sm box-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)' }}
              className="text-slate-400 text-lg pointer-events-none">🔍</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
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

        {/* Bottom Button */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100">
          <button 
            onClick={() => handleDirections("GSU Campus")} 
            className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-bold shadow-xl hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <span>🧭</span> Get Directions to Campus
          </button>
        </div>
      </section>

      {/* 2. Main Area (Map Loading) */}
      <section className="flex-1 relative bg-slate-100/30">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex bg-white/90 backdrop-blur-md p-2 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/50 z-20">
          <button 
            onClick={() => setCommuteMode("CAR")}
            className={`px-12 py-3 rounded-full text-sm font-black transition-all ${commuteMode === "CAR" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            🚗 CAR
          </button>
          <button 
            onClick={() => setCommuteMode("MARTA")}
            className={`px-12 py-3 rounded-full text-sm font-black transition-all ${commuteMode === "MARTA" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            🚆 MARTA
          </button>
        </div>

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