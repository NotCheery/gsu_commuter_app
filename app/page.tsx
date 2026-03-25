"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Card from "../components/Card";

// Dynamically import CampusMap (Leaflet requires client-side rendering)
const CampusMap = dynamic(() => import("@/components/CampusMap"), {
  ssr: false,
});

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [commuteMode, setCommuteMode] = useState<"CAR" | "MARTA">("CAR");
  const [routeInfo, setRouteInfo] = useState<any>(null);

  // ---------------------------
  // Static parking data (With ORS-friendly Coords: Lng, Lat)
  // ---------------------------
  const parkingDecks = [
    { name: "T Deck", status: "Full", location: "43 Gilmer St SE", coords: "-84.3866,33.7551" },
    { name: "M Deck", status: "Open", location: "33 Auburn Ave", coords: "-84.3839,33.7532" },
    { name: "G Deck", status: "Limited", location: "121 Collins St", coords: "-84.3875,33.7519" },
    { name: "N Deck", status: "Limited", location: "Near Petite Science", coords: "-84.3855,33.7560" },
    { name: "CC Deck", status: "Open", location: "Campus Center", coords: "-84.3863,33.7537" }
  ];

  // ---------------------------
  // Static MARTA stations (With ORS-friendly Coords: Lng, Lat)
  // ---------------------------
  const martaStations = [
    { name: "Five Points", status: "Arriving", location: "8 min wait", coords: "-84.3915,33.7525" },
    { name: "Georgia State", status: "Open", location: "4 min wait", coords: "-84.3853,33.7537" },
    { name: "Peachtree Center", status: "Delayed", location: "15 min wait", coords: "-84.3876,33.7599" }
  ];

  const filteredDecks = parkingDecks.filter(deck =>
    deck.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStations = martaStations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ---------------------------
  // Fetch route comparison (Using Coords)
  // ---------------------------
  const fetchRoute = async (destCoords: string) => {
    try {
      // GSU Center Point (Longitude, Latitude)
      const origin = "-84.3863,33.7537"; 

      const res = await fetch(
        `/api/routes?origin=${origin}&destination=${destCoords}`
      );

      const data = await res.json();
      setRouteInfo(data); 
    } catch (err) {
      console.error("Route fetch error:", err);
    }
  };

  return (
    <main className="flex h-screen w-full bg-[#FDFCF7] font-sans overflow-hidden text-slate-900">

      {/* ===================== SIDEBAR ===================== */}
      <section className="w-[420px] bg-white border-r border-slate-200 shadow-xl flex flex-col z-30 overflow-hidden">

        {/* Header */}
        <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-br-[40px] shadow-lg">
          <h1 className="text-2xl font-black tracking-tighter italic">GSU COMMUTER</h1>
          <p className="text-[10px] font-bold opacity-70 mt-1 tracking-[0.2em]">SMART CAMPUS NAVIGATION</p>
        </div>

        {/* Search bar */}
        <div className="px-8 py-6 border-b border-slate-100 bg-[#F9F7F0]/50">
          <input
            type="text"
            placeholder="Search for parking or stations..."
            className="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* ===================== ROUTE RECOMMENDATION UI ===================== */}
        {routeInfo && (
          <div className="mx-8 my-4 p-5 bg-blue-50 rounded-3xl border border-blue-100 shadow-sm relative animate-in fade-in slide-in-from-top-4 duration-300">
            <button 
              onClick={() => setRouteInfo(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
            >
              ✕
            </button>
            <p className="font-bold text-blue-900 text-xs mb-3 flex items-center gap-2">
              ⭐ RECOMMENDED: <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">{routeInfo.recommended}</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Car</p>
                <p className="text-lg font-black text-slate-700">{routeInfo.car} min</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Marta</p>
                <p className="text-lg font-black text-slate-700">{routeInfo.marta} min</p>
              </div>
            </div>
          </div>
        )}

        {/* ===================== LIST CONTENT ===================== */}
        <div className="flex-1 overflow-y-auto px-4">
          {commuteMode === "CAR" ? (
            <div className="space-y-1 py-4">
              {filteredDecks.map((deck) => (
                <Card
                  key={deck.name}
                  title={deck.name}
                  subtitle={deck.location}
                  status={deck.status}
                  onClick={() => fetchRoute(deck.coords)} 
                />
              ))}
            </div>
          ) : (
            <div className="space-y-1 py-4">
              {filteredStations.map((station) => (
                <Card
                  key={station.name}
                  title={station.name}
                  subtitle={station.location}
                  status={station.status}
                  onClick={() => fetchRoute(station.coords)} 
                />
              ))}
            </div>
          )}
        </div>

        {/* ===================== TOGGLE BUTTONS ===================== */}
        <div className="p-6 border-t bg-white">
          <div className="flex gap-2">
            <button
              onClick={() => setCommuteMode("CAR")}
              className={`flex-1 py-4 rounded-xl text-xs font-black transition-all ${
                commuteMode === "CAR"
                  ? "bg-blue-600 text-white shadow-lg scale-[1.02]"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              🚗 CAR
            </button>
            <button
              onClick={() => setCommuteMode("MARTA")}
              className={`flex-1 py-4 rounded-xl text-xs font-black transition-all ${
                commuteMode === "MARTA"
                  ? "bg-blue-600 text-white shadow-lg scale-[1.02]"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              🚆 MARTA
            </button>
          </div>
        </div>
      </section>

      {/* ===================== MAP ===================== */}
      <section className="flex-1 relative h-full w-full z-0">
        <div className="w-full h-full">
          {/* We pass routeInfo.path so the map can draw the line later */}
          <CampusMap commuteMode={commuteMode} routePath={routeInfo?.path} />
        </div>
      </section>

    </main>
  );
}
