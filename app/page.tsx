"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Card from "../components/Card";

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

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Geolocation error:", err);
          // fallback to default location
          setUserCoords({ lat: 33.7537, lng: -84.3863 });
        }
      );
    } else {
      console.warn("Geolocation not available, using default location");
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
  // Static MARTA TRAIN stations (coords as strings "lng,lat")
  // ---------------------------
  const martaStations = [
    { name: "Five Points", status: "Arriving", location: "8 min wait", coords: "-84.3915,33.7525" },
    { name: "Georgia State", status: "Open", location: "4 min wait", coords: "-84.3853,33.7537" },
    { name: "Peachtree Center", status: "Delayed", location: "15 min wait", coords: "-84.3876,33.7599" }
  ];

  // ---------------------------
  // Static MARTA BUS routes (coords as strings "lng,lat")
  // ---------------------------
  const busRoutes = [
    { name: "Route 816", location: "Courtland St & Gilmer St", status: "Active", coords: "-84.3855,33.7558", route: "816" },
    { name: "Route 40", location: "Courtland St & Gilmer St", status: "Active", coords: "-84.3855,33.7558", route: "40" },
    { name: "Route 816", location: "Piedmont Ave & Auburn Ave", status: "Active", coords: "-84.3842,33.7548", route: "816" },
    { name: "Route 40", location: "Peachtree Center Ave & John Wesley Dobbs", status: "Active", coords: "-84.3858,33.7583", route: "40" },
    { name: "Route 110", location: "Peachtree Center Ave & John Wesley Dobbs", status: "Delayed", coords: "-84.3858,33.7583", route: "110" },
    { name: "Route 21", location: "Decatur St & Central Ave", status: "Active", coords: "-84.3881,33.7531", route: "21" },
    { name: "Route 42", location: "Decatur St & Central Ave", status: "Active", coords: "-84.3881,33.7531", route: "42" }
  ];

  // ---------------------------
  // Group bus routes by location
  // ---------------------------
  const groupedBusStops = Object.values(
    busRoutes.reduce((acc, bus) => {
      if (!acc[bus.location]) {
        acc[bus.location] = {
          location: bus.location,
          coords: bus.coords,
          routes: []
        };
      }
      acc[bus.location].routes.push(bus.name);
      return acc;
    }, {} as Record<string, { location: string; coords: string; routes: string[] }>)
  );

  // ---------------------------
  // Filters
  // ---------------------------
  const filteredDecks = parkingDecks.filter(deck =>
    deck.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStations = martaStations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBuses = groupedBusStops.filter(stop =>
    stop.location.toLowerCase().includes(searchQuery.toLowerCase())
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
              {filteredStations.map((station) => (
                <Card key={station.name} title={station.name} subtitle={station.location} status={station.status} onClick={() => fetchRoute(station.coords)} />
              ))}
            </div>
          )}

          {/* BUS VIEW */}
          {commuteMode === "BUS" && (
            <div className="space-y-1 py-4">
              {filteredBuses.map((stop) => {
                const status = stop.routes.some((r) => {
                  const bus = busRoutes.find(b => b.name === r && b.location === stop.location);
                  return bus?.status === "Delayed";
                }) ? "Delayed" : "Active";

                return (
                  <Card
                    key={stop.location}
                    title={stop.routes.join(", ")}
                    subtitle={stop.location}
                    status={status}
                    onClick={() => fetchRoute(stop.coords)}
                  />
                );
              })}
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
          busRoutes={busRoutes} 
          busData={[]} 
          trainData={[]} 
          userLocation={userCoords}
        />
      </section>
    </main>
  );
}