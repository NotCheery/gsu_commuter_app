"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Card from "../components/Card";
import { useNearbyTrains, useNearbyBuses } from "@/lib/hooks/useMartaData";

// Dynamically import CampusMap (Leaflet requires client-side rendering)
const CampusMap = dynamic(() => import("@/components/CampusMap"), { ssr: false });

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [commuteMode, setCommuteMode] = useState<"CAR" | "TRAIN" | "BUS">("CAR");
  const [routeInfo, setRouteInfo] = useState<any>(null);

  // ---------------------------
  // USER LOCATION STATE
  // ---------------------------
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch real-time MARTA data
  const { trains: nearbyTrains, loading: trainsLoading } = useNearbyTrains(userCoords);
  const { buses: nearbyBuses, loading: busesLoading } = useNearbyBuses(userCoords);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserCoords(coords);
          console.log("✅ Geolocation successful:", coords);
        },
        (err) => {
          console.error("❌ Geolocation error:", err);
          console.warn("⚠️ Using default GSU location");
          // fallback to default location
          setUserCoords({ lat: 33.7537, lng: -84.3863 });
        }
      );
    } else {
      console.warn("⚠️ Geolocation not available, using default location");
      setUserCoords({ lat: 33.7537, lng: -84.3863 });
    }
  }, []);

  // ---------------------------
  // Static parking data (coords as strings "lng,lat")
  // ---------------------------
  const parkingDecks = [
    { name: "T Deck", status: "Full", location: "43 Gilmer St SE", coords: "-84.3866,33.7551" },
    { name: "M Deck", status: "Open", location: "33 Auburn Ave", coords: "-84.3839,33.7532" },
    { name: "G Deck", status: "Limited", location: "121 Collins St", coords: "-84.3875,33.7519" },
    { name: "N Deck", status: "Limited", location: "Near Petite Science", coords: "-84.3855,33.7560" },
    { name: "Campus Center Deck", status: "Open", location: "Campus Center", coords: "-84.3863,33.7537" },
    { name: "Convocation Center Lot", status: "Open", location: "Summerhill Campus", coords: "-84.3895,33.7420" }
  ];

  // ---------------------------
  // Group bus routes by location
  // ---------------------------
  const groupedBusStops = Object.values(
    nearbyBuses.reduce((acc, stop) => {
      if (!acc[stop.name]) {
        acc[stop.name] = {
          name: stop.name,
          location: stop.name,
          coords: stop.coords,
          routes: stop.routes || [],
          distance: stop.distance,
        };
      }
      return acc;
    }, {} as Record<string, any>)
  );

  // ---------------------------
  // Filters
  // ---------------------------
  const filteredDecks = parkingDecks.filter(deck =>
    deck.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStations = nearbyTrains.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBuses = groupedBusStops.filter(stop =>
    stop.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ---------------------------
  // Fetch route comparison
  // ---------------------------
  const fetchRoute = async (destCoords: string) => {
    try {
      const origin = userCoords ? `${userCoords.lng},${userCoords.lat}` : "-84.3863,33.7537";
      const res = await fetch(`/api/routes?origin=${origin}&destination=${destCoords}`);
      const data = await res.json();

      if (commuteMode === "BUS" && data.marta && !data.bus) data.bus = data.marta;
      if (!data.train && data.marta) data.train = data.marta;

      setRouteInfo(data);
    } catch (err) {
      console.error("Route fetch error:", err);
    }
  };

  return (
    <main className="flex h-screen w-full bg-[#FDFCF7] font-sans overflow-hidden text-slate-900">

      {/* SIDEBAR */}
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

        {/* Route recommendation with costs*/}
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

            <div className="grid grid-cols-3 gap-3 mb-4">
              {/* Car Column */}
              <div className="bg-white p-3 rounded-xl border border-blue-100 flex flex-col items-center">
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Car</p>
                <p className="text-lg font-black text-slate-700">{routeInfo.car ?? "--"} min</p>
                <p className="text-[10px] font-bold text-blue-600">${routeInfo.costs?.car}</p>
              </div>

              {/* Train Column */}
              <div className="bg-white p-3 rounded-xl border border-blue-100 flex flex-col items-center">
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Train</p>
                <p className="text-lg font-black text-slate-700">{routeInfo.train ?? "--"} min</p>
                <p className="text-[10px] font-bold text-green-600">$2.50</p>
              </div>

              {/* Bus Column */}
              <div className="bg-white p-3 rounded-xl border border-blue-100 flex flex-col items-center">
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Bus</p>
                <p className="text-lg font-black text-slate-700">{routeInfo.bus ?? "--"} min</p>
                <p className="text-[10px] font-bold text-green-600">$2.50</p>
              </div>
            </div>

            {/* Dynamic Recommendation Message */}
            <div className="bg-blue-600/5 p-3 rounded-xl border border-blue-200">
              <p className="text-[11px] font-medium text-blue-800 leading-tight">
                {routeInfo.recMessage}
              </p>
            </div>
          </div>
        )}

        {/* LIST CONTENT */}
        <div className="flex-1 overflow-y-auto px-4">
          {/* CAR VIEW */}
          {commuteMode === "CAR" && (
            <div className="space-y-1 py-4">
              {filteredDecks.map((deck) => (
                <Card
                  key={deck.name}
                  title={deck.name}
                  subtitle={deck.location}
                  status={deck.status}
                  onClick={() => fetchRoute(deck.coords)} // coords is a string
                />
              ))}
            </div>
          )}

          {/* TRAIN VIEW */}
          {commuteMode === "TRAIN" && (
            <div className="space-y-1 py-4">
              {trainsLoading ? (
                <div className="p-4 text-center text-slate-500 text-sm">Loading nearby stations...</div>
              ) : filteredStations.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">No nearby train stations found</div>
              ) : (
                filteredStations.map((station) => {
                  // Get the next arrival time
                  const nextArrival = station.arrivals && station.arrivals.length > 0 
                    ? `${station.arrivals[0].WAITING_TIME || "Unknown"}`
                    : "No data";
                  
                  return (
                    <Card
                      key={station.name}
                      title={station.name}
                      subtitle={`${(station.distance || 0).toFixed(2)} mi • ${station.line}`}
                      status={nextArrival}
                      onClick={() => fetchRoute(station.coords)}
                    />
                  );
                })
              )}
            </div>
          )}

          {/* BUS VIEW */}
          {commuteMode === "BUS" && (
            <div className="space-y-1 py-4">
              {busesLoading ? (
                <div className="p-4 text-center text-slate-500 text-sm">Loading nearby bus stops...</div>
              ) : filteredBuses.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">No nearby bus stops found</div>
              ) : (
                filteredBuses.map((stop) => {
                  const routesString = stop.routes.join(", ");
                  const status = stop.routes && stop.routes.length > 0 ? "Active" : "Pending";
                  
                  return (
                    <Card
                      key={stop.name}
                      title={`Routes: ${routesString}`}
                      subtitle={`${(stop.distance || 0).toFixed(2)} mi • ${stop.name}`}
                      status={status}
                      onClick={() => fetchRoute(stop.coords)}
                    />
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* TOGGLE BUTTONS */}
        <div className="p-6 border-t bg-white flex gap-2">
          <button onClick={() => setCommuteMode("CAR")} className={`flex-1 py-4 rounded-xl text-xs font-black transition-all ${commuteMode === "CAR" ? "bg-blue-600 text-white shadow-lg scale-[1.02]" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>🚗 CAR</button>
          <button onClick={() => setCommuteMode("TRAIN")} className={`flex-1 py-4 rounded-xl text-xs font-black transition-all ${commuteMode === "TRAIN" ? "bg-blue-600 text-white shadow-lg scale-[1.02]" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>🚆 TRAIN</button>
          <button onClick={() => setCommuteMode("BUS")} className={`flex-1 py-4 rounded-xl text-[10px] font-black transition-all ${commuteMode === "BUS" ? "bg-blue-600 text-white shadow-lg scale-[1.02]" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>🚌 BUS</button>
        </div>
      </section>

      {/* MAP */}
      <section className="flex-1 relative h-full w-full z-0">
        <CampusMap 
          commuteMode={commuteMode} 
          routePath={routeInfo?.path} 
          busRoutes={[]} 
          busData={[]} 
          trainData={[]} 
        />
      </section>
    </main>
  );
}