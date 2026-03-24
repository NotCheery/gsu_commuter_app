"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Badge from "../components/Badge";
import Card from "../components/Card";

// Dynamically import CampusMap (important for Leaflet in Next.js)
const CampusMap = dynamic(() => import("@/components/CampusMap"), {
  ssr: false,
});

export default function Dashboard() {
  // 1. State Management (React State)
  const [searchQuery, setSearchQuery] = useState(""); // Save Search Term
  const [commuteMode, setCommuteMode] = useState("CAR"); // Current Mode (Car or MARTA)

  // 2. Placeholder Data
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

  // 3. Search Filtering
  const filteredDecks = parkingDecks.filter(deck =>
    deck.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStations = martaStations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 4. Directions Function
  const handleDirections = (dest: string) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        dest + " Georgia State University"
      )}`,
      "_blank"
    );
  };

  return (
    <main className="flex h-screen w-full bg-[#FDFCF7] font-sans overflow-hidden text-slate-900">

      {/* Left Sidebar */}
      <section className="w-[420px] bg-white border-r border-slate-200 shadow-xl flex flex-col z-30 overflow-hidden">
        
        {/* Header */}
        <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-br-[40px] shadow-lg">
          <h1 className="text-2xl font-black tracking-tighter italic">
            GSU COMMUTER
          </h1>
          <p className="text-[10px] font-bold opacity-70 mt-1 tracking-[0.2em]">
            SMART CAMPUS NAVIGATION
          </p>
        </div>

        {/* Search */}
        <div className="px-8 py-6 border-b border-slate-100 bg-[#F9F7F0]/50">
          <input
            type="text"
            placeholder="Search for parking or stations..."
            className="w-full px-4 py-3 border rounded-xl text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {commuteMode === "CAR" ? (
            <div>
              <h2 className="px-10 mt-6 text-xs font-bold text-slate-400 uppercase">
                Live Parking
              </h2>

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
          ) : (
            <div>
              <h2 className="px-10 mt-6 text-xs font-bold text-slate-400 uppercase">
                Nearby Stations
              </h2>

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
          )}
        </div>

        {/* Bottom Button */}
        <div className="p-6 border-t">
          <button
            onClick={() => handleDirections("GSU Campus")}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold"
          >
            Get Directions to Campus
          </button>
        </div>
      </section>

      {/* Right Map Area */}
      <section className="flex-1 relative h-full w-full">
        
        {/* Mode Switch */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex gap-3 bg-white/60 backdrop-blur-md p-2 rounded-full">
          <button
            onClick={() => setCommuteMode("CAR")}
            className={`px-10 py-2 rounded-full text-xs font-bold ${
              commuteMode === "CAR" ? "bg-black text-white" : ""
            }`}
          >
            CAR
          </button>

          <button
            onClick={() => setCommuteMode("MARTA")}
            className={`px-10 py-2 rounded-full text-xs font-bold ${
              commuteMode === "MARTA" ? "bg-black text-white" : ""
            }`}
          >
            MARTA
          </button>
        </div>

        {/* Map Container MUST fill full height */}
        <div className="w-full h-full">
          <CampusMap commuteMode={commuteMode} />
        </div>
      </section>
    </main>
  );
}
