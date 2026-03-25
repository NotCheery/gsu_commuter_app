"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Card from "../components/Card";

// Dynamically import CampusMap because Leaflet requires client-side rendering
const CampusMap = dynamic(() => import("@/components/CampusMap"), {
  ssr: false,
});

export default function Dashboard() {
  // 🔹 Controls search input
  const [searchQuery, setSearchQuery] = useState("");

  // 🔹 Controls whether we are viewing CAR or MARTA mode
  const [commuteMode, setCommuteMode] = useState<"CAR" | "MARTA">("CAR");

  // ---------------------------
  // Static parking data
  // ---------------------------
  const parkingDecks = [
    { name: "T Deck", status: "Full", location: "43 Gilmer St SE" },
    { name: "M Deck", status: "Open", location: "33 Auburn Ave" },
    { name: "G Deck", status: "Limited", location: "121 Collins St" },
    { name: "S Deck", status: "Limited", location: "Near Petite Science Center" },
    { name: "CC Deck", status: "Open", location: "Campus Center" }
  ];

  // ---------------------------
  // Static MARTA stations (for sidebar list)
  // ---------------------------
  const martaStations = [
    { name: "Five Points", status: "Arriving", location: "Northbound - 9 min" },
    { name: "Georgia State", status: "Open", location: "Eastbound - 5 min" },
    { name: "Peachtree Center", status: "Delayed", location: "Southbound - 15 min" }
  ];

  // ---------------------------
  // Filter lists based on search input
  // ---------------------------
  const filteredDecks = parkingDecks.filter(deck =>
    deck.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStations = martaStations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ---------------------------
  // Open Google Maps directions
  // ---------------------------
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

      {/* ===================== SIDEBAR ===================== */}
      <section className="w-[420px] bg-white border-r border-slate-200 shadow-xl flex flex-col z-30 overflow-hidden relative">

        {/* Header */}
        <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-br-[40px] shadow-lg">
          <h1 className="text-2xl font-black tracking-tighter italic">
            GSU COMMUTER
          </h1>
          <p className="text-[10px] font-bold opacity-70 mt-1 tracking-[0.2em]">
            SMART CAMPUS NAVIGATION
          </p>
        </div>

        {/* Search input */}
        <div className="px-8 py-6 border-b border-slate-100 bg-[#F9F7F0]/50">
          <input
            type="text"
            placeholder="Search for parking or stations..."
            className="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Sidebar content changes based on commute mode */}
        <div className="flex-1 overflow-y-auto">
          {commuteMode === "CAR" ? (
            <div>
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

        {/* 🔹 BUTTONS AT THE VERY BOTTOM (NO WHITE BLOCK BELOW) */}
        <div className="p-6 border-t bg-white">
          <div className="flex gap-2">
            <button
              onClick={() => setCommuteMode("CAR")}
              className={`flex-1 py-4 rounded-xl text-xs font-black transition-all ${
                commuteMode === "CAR"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              🚗 CAR
            </button>

            <button
              onClick={() => setCommuteMode("MARTA")}
              className={`flex-1 py-4 rounded-xl text-xs font-black transition-all ${
                commuteMode === "MARTA"
                  ? "bg-blue-600 text-white shadow-md"
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
          <CampusMap commuteMode={commuteMode} />
        </div>
      </section>

    </main>
  );
}
