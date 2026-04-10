"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Card from "../components/Card";
import TrainArrivalDetails from "../components/TrainArrivalDetails";
import { useNearbyTrains, useNearbyBuses } from "@/lib/hooks/useMartaData";

const CampusMap = dynamic(() => import("@/components/CampusMap"), { ssr: false });

const ALL_RAIL_STATIONS = [
  { name: "Chamblee", coords: "-84.3018,33.8863", line: "Gold" },
  { name: "Georgia State", coords: "-84.3853,33.7537", line: "Blue/Green" },
  { name: "Five Points", coords: "-84.3915,33.7525", line: "All Lines" },
  { name: "Peachtree Center", coords: "-84.3876,33.7599", line: "Red/Gold" },
  { name: "Airport", coords: "-84.4471,33.6603", line: "Red/Gold" },
  { name: "Buckhead", coords: "-84.3681,33.8484", line: "Red" },
  { name: "Midtown", coords: "-84.3865,33.7807", line: "Red/Gold" },
  { name: "Arts Center", coords: "-84.3865,33.7891", line: "Red/Gold" },
];

const ALL_BUS_STOPS = [
  { name: "Courtland St & Gilmer St", coords: "-84.3855,33.7558", routes: ["40", "816"] },
  { name: "Piedmont Ave & Auburn Ave", coords: "-84.3842,33.7548", routes: ["816", "12"] },
  { name: "Peachtree Center Ave & John Wesley Dobbs", coords: "-84.3858,33.7583", routes: ["110", "40"] },
  { name: "Decatur St & Central Ave", coords: "-84.3881,33.7531", routes: ["21", "42"] },
  { name: "Auburn Ave & Hilliard St", coords: "-84.3815,33.7495", routes: ["12", "40"] },
  { name: "Capitol Ave & Mitchell St", coords: "-84.3921,33.7521", routes: ["15", "40"] },
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [commuteMode, setCommuteMode] = useState<"CAR" | "TRAIN" | "BUS">("CAR");
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [trainArrivals, setTrainArrivals] = useState<any[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const { trains: nearbyTrains } = useNearbyTrains(userCoords);
  const { buses: nearbyBuses } = useNearbyBuses(userCoords);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => setUserCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => setUserCoords({ lat: 33.7537, lng: -84.3863 })
      );
    }
  }, []);

  // --- COST & TIME FETCH LOGIC ---
  const fetchRoute = async (destCoords: string) => {
    const origin = userCoords ? `${userCoords.lng},${userCoords.lat}` : "-84.3863,33.7537";
    try {
      const res = await fetch(`/api/routes?origin=${origin}&destination=${destCoords}`);
      const data = await res.json();
      setRouteInfo(data);
    } catch (err) {
      console.error("Route calculation error:", err);
    }
  };

  const handleTrainClick = async (station: any) => {
    setSelectedStation(station);
    fetchRoute(station.coords); // Triggers Time/Cost
    try {
      const res = await fetch(`/api/marta?station=${encodeURIComponent(station.name)}`);
      const data = await res.json();
      setTrainArrivals(data);
    } catch (err) {
      setTrainArrivals([]);
    }
  };

  // --- FILTERING ---
  const displayBuses = useMemo(() => {
    const combined = ALL_BUS_STOPS.map(b => {
      const live = nearbyBuses.find(n => n.name.toLowerCase().includes(b.name.toLowerCase()));
      return live ? { ...b, ...live } : b;
    });
    return combined.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, nearbyBuses]);

  const displayStations = useMemo(() => {
    const combined = ALL_RAIL_STATIONS.map(s => {
      const live = nearbyTrains.find(n => n.name.toLowerCase().includes(s.name.toLowerCase()));
      return live ? { ...s, ...live } : s;
    });
    return combined.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, nearbyTrains]);

  const parkingDecks = [
    { name: "T Deck", status: "Full", location: "43 Gilmer St SE", coords: "-84.3866,33.7551" },
    { name: "M Deck", status: "Open", location: "33 Auburn Ave", coords: "-84.3839,33.7532" },
    { name: "G Deck", status: "Limited", location: "121 Collins St", coords: "-84.3875,33.7519" },
    { name: "N Deck", status: "Limited", location: "Near Petite Science", coords: "-84.3855,33.7560" },
    { name: "Campus Center Deck", status: "Open", location: "Campus Center", coords: "-84.3863,33.7537" },
    { name: "Convocation Center Lot", status: "Open", location: "Summerhill Campus", coords: "-84.3895,33.7420" }
  ].filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <main className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden text-slate-900">
      <aside className="w-[420px] bg-white border-r flex flex-col z-30 shadow-xl">

        {/* GSU BRANDED HEADER */}
        <div className="p-8 bg-white border-b border-slate-100 rounded-br-[40px]">
          <h1 className="text-2xl font-black italic tracking-tighter"
          style={{ color: "#0039A6" }}>GSU COMMUTER</h1>
          <input
            type="text"
            placeholder="Search Chamblee, T-Deck, etc..."
            className="w-full mt-4 px-4 py-3 rounded-lg text-slate-800 text-sm outline-none"
            style={{ boxSizing: 'border-box' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* TIME & COST PANEL */}
        {routeInfo && (
          <div className="mx-6 my-4 p-5 bg-blue-50 rounded-3xl border border-blue-100 relative animate-in fade-in slide-in-from-top-4"
          style={{ backgroundColor: "#c7d6ed"}}>
            <button onClick={() => setRouteInfo(null)} className="absolute top-3 right-3 text-slate-400">✕</button>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-white p-2 rounded-xl text-center shadow-sm">
                <p className="text-[9px] font-bold text-slate-400 uppercase">🚗 Car</p>
                <p className="text-sm font-black text-slate-700">{routeInfo.car} min</p>
                <p className="text-[10px] text-blue-600 font-bold">${routeInfo.costs?.car}</p>
              </div>
              <div className="bg-white p-2 rounded-xl text-center shadow-sm">
                <p className="text-[9px] font-bold text-slate-400 uppercase">🚆 Train</p>
                <p className="text-sm font-black text-slate-700">{routeInfo.train} min</p>
                <p className="text-[10px] text-green-600 font-bold">$2.50</p>
              </div>
              <div className="bg-white p-2 rounded-xl text-center shadow-sm">
                <p className="text-[9px] font-bold text-slate-400 uppercase">🚌 Bus</p>
                <p className="text-sm font-black text-slate-700">{routeInfo.bus} min</p>
                <p className="text-[10px] text-green-600 font-bold">$2.50</p>
              </div>
            </div>
            <p className="text-[11px] font-medium text-blue-800 bg-blue-100/50 p-2 rounded-lg">{routeInfo.recMessage}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {commuteMode === "CAR" && parkingDecks.map(d => (
            <Card key={d.name} title={d.name} subtitle={d.location} status={d.status} onClick={() => fetchRoute(d.coords)} />
          ))}
          
          {commuteMode === "TRAIN" && (
            selectedStation ? (
              <TrainArrivalDetails stationName={selectedStation.name} arrivals={trainArrivals} onBack={() => setSelectedStation(null)} isLoading={false} />
            ) : displayStations.map(s => (
              <Card key={s.name} title={s.name} subtitle={s.line} status="View Info" onClick={() => handleTrainClick(s)} />
            ))
          )}

          {commuteMode === "BUS" && displayBuses.map(b => (
            <Card key={b.name} title={b.name} subtitle={b.routes.join(", ")} status="Bus Stop" onClick={() => fetchRoute(b.coords)} />
          ))}
        </div>

        {/* BOTTOM NAV */}
        <nav className="p-5 border-t border-slate-100 bg-white flex gap-2 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          {["CAR", "TRAIN", "BUS"].map(m => (
            <button 
              key={m} 
              onClick={() => { setCommuteMode(m as any); setSelectedStation(null); }} 
              style={{
                //Color separation when the toggle button is pressed and when it is not.
                backgroundColor: commuteMode === m ? "#154ebb" : "#DCE4F0",
                color: commuteMode === m ? "white" : "#7296C1",
              }}
              
              className={`flex-1 py-6 rounded-2xl text-sm font-black tracking-widest transition-all border-none outline-none shadow-sm ${
                commuteMode === m ? "shadow-md scale-[1.05]" : "hover:bg-[#BAC9E0]"
              }`}
            >
              {m}
            </button>
          ))}
        </nav>
      </aside>

      <section className="flex-1">
        <CampusMap 
          commuteMode={commuteMode} 
          routePath={routeInfo?.path} 
          trainData={displayStations} 
          busData={displayBuses} 
        />
      </section>
    </main>
  );
}