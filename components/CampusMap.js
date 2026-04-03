"use client";

import { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline, // Added Polyline
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./CampusMap.css";

/* ---------------------------
   Fix Leaflet default marker icons
---------------------------- */
if (typeof window !== "undefined") {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
  });
}

const CAMPUS_CENTER = [33.753746, -84.38633];

//parking deck coordinates
const PARKING_DECKS = [
  { id: 1, name: "T Deck", coords: [33.755135, -84.386687] },
  { id: 2, name: "M Deck", coords: [33.753237, -84.383996] },
  { id: 4, name: "N Deck", coords: [33.7560, -84.3855] },
  { id: 5, name: "G Deck", coords: [33.751995, -84.387549] },
  { id: 6, name: "Campus Center Deck", coords: [33.7537, -84.3863] }, // Added CC Deck
  { id: 7, name: "Convocation Center Deck ", coords: [33.742055, -84.389582] } //added convocation center
];

//train station coordinates
const STATIONS = [
  { name: "Georgia State", coords: [33.7537, -84.3853] },
  { name: "Five Points", coords: [33.7525, -84.3915] },
  { name: "Peachtree Center", coords: [33.7599, -84.3876] }
];

/* ---------------------------
   Recenter map helper
---------------------------- */
function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 16);
  }, [position, map]);
  return null;
}

/* ---------------------------
   Fit route helper
---------------------------- */
function FitRoute({ path }) {
  const map = useMap();
  useEffect(() => {
    if (path && path.length > 0) {
      const bounds = L.polyline(path).getBounds();
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [path, map]);
  return null;
}

/* ---------------------------
   CampusMap Component
---------------------------- */
export default function CampusMap({
  commuteMode,
  routePath,
  busRoutes = [],
  busData = [],
  trainData = []
}) {
  const [userPosition, setUserPosition] = useState(null);

  /* ---------------------------
     Get user location
  ---------------------------- */
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
        () => console.warn("Location not available")
      );
    }
  }, []);

  /* ---------------------------
     Convert busRoutes → grouped stops for map
  ---------------------------- */
  const BUS_STOPS = useMemo(() => {
    if (!busRoutes.length) return [];

    return Object.values(
      busRoutes.reduce((acc, bus) => {
        if (!acc[bus.location]) {
          acc[bus.location] = {
            name: bus.location,
            coords: [
              parseFloat(bus.coords.split(",")[1]), // lat
              parseFloat(bus.coords.split(",")[0])  // lng
            ],
            routes: []
          };
        }
        acc[bus.location].routes.push(bus.route);
        return acc;
      }, {})
    );
  }, [busRoutes]);

  /* ---------------------------
     Swap [lng, lat] from ORS to [lat, lng] for Leaflet
  ---------------------------- */
  const formattedPath = useMemo(() => {
    if (!routePath) return null;
    return routePath.map((coords) => [coords[1], coords[0]]);
  }, [routePath]);

  return (
    <MapContainer center={CAMPUS_CENTER} zoom={16} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 🛣️ THE ROUTE LINE */}
      {formattedPath && (
        <>
          <Polyline
            positions={formattedPath}
            pathOptions={{
              color: commuteMode === "CAR" ? "#2563eb" : "#9333ea",
              weight: 6,
              opacity: 0.7,
              lineJoin: "round"
            }}
          />
          <FitRoute path={formattedPath} />
        </>
      )}

      {/* 🚌 LIVE BUS MARKERS (From GTFS-RT) */}
      {commuteMode === "BUS" && busData.map((bus, idx) => (
        <CircleMarker
          key={`bus-${idx}`}
          center={[parseFloat(bus.LATITUDE), parseFloat(bus.LONGITUDE)]}
          radius={10}
          pathOptions={{ color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.9 }}
        >
          <Popup>
            <div className="text-sm font-bold">🚌 Bus #{bus.VEHICLE_ID}</div>
            <p className="text-xs text-slate-500">Route: {bus.ROUTE}</p>
          </Popup>
        </CircleMarker>
      ))}

      {/* 🚄 TRAIN STATIONS */}
      {commuteMode === "TRAIN" && STATIONS.map((station, i) => (
        <CircleMarker
          key={`rail-${i}`}
          center={station.coords}
          radius={10}
          pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.8 }}
        >
          <Popup><strong>{station.name} Rail Station</strong></Popup>
        </CircleMarker>
      ))}

      {/* 🚗 Parking markers */}
      {commuteMode === "CAR" && PARKING_DECKS.map((deck) => (
      <CircleMarker
        key={deck.id}
        center={deck.coords} // deck.coords is already [lat, lng] in your STATIONS/PARKING_DECKS arrays
        radius={8}
        pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 0.6 }}
      >
        <Popup><strong>{deck.name}</strong></Popup>
      </CircleMarker>
    ))}

      {/* 🚏 BUS STOPS */}
      {commuteMode === "BUS" && BUS_STOPS.map((stop, i) => (
        <CircleMarker
          key={`stop-${i}`}
          center={stop.coords}
          radius={6}
          pathOptions={{ color: "#f59e0b", fillColor: "white", fillOpacity: 1, weight: 3 }}
        >
          <Popup>
            <div className="font-bold">🚏 {stop.name}</div>
            <div className="text-xs text-slate-500">Serves: {stop.routes.join(", ")}</div>
          </Popup>
        </CircleMarker>
      ))}

      {/* 🔴 USER LOCATION */}
      {userPosition && (
        <CircleMarker center={userPosition} radius={6} pathOptions={{ color: "red" }}>
          <Popup>You</Popup>
        </CircleMarker>
      )}
    </MapContainer>
  );
}