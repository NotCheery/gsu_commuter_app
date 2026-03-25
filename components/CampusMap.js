"use client";

import { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline, // 👈 Added Polyline
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

const PARKING_DECKS = [
  { id: 1, name: "T Deck", coords: [33.755135, -84.386687] },
  { id: 2, name: "M Deck", coords: [33.753237, -84.383996] },
  { id: 4, name: "N Deck", coords: [33.7560, -84.3855] },
  { id: 5, name: "G Deck", coords: [33.751995, -84.387549] }
];

const STATIONS = [
  { name: "Georgia State", coords: [33.7537, -84.3853] },
  { name: "Five Points", coords: [33.7525, -84.3915] },
  { name: "Peachtree Center", coords: [33.7599, -84.3876] }
];

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 16);
    }
  }, [position, map]);
  return null;
}

// 👈 NEW: This component zooms the map to fit the entire route line
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

export default function CampusMap({ commuteMode, routePath }) {
  const [map, setMap] = useState(null);
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
      () => console.warn("Location not available")
    );
  }, []);

  // 👈 FIX: Swap [lng, lat] from ORS to [lat, lng] for Leaflet
  const formattedPath = useMemo(() => {
    if (!routePath) return null;
    return routePath.map((coords) => [coords[1], coords[0]]);
  }, [routePath]);

  return (
    <MapContainer
      center={CAMPUS_CENTER}
      zoom={16}
      style={{ height: "100%", width: "100%" }}
      ref={setMap}
    >
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
              lineJoin: 'round'
            }} 
          />
          <FitRoute path={formattedPath} />
        </>
      )}

      {/* 🚗 Parking markers */}
      {commuteMode === "CAR" && PARKING_DECKS.map((deck) => (
        <CircleMarker
          key={deck.id}
          center={deck.coords}
          radius={8}
          pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 0.6 }}
        >
          <Popup><strong>{deck.name}</strong></Popup>
        </CircleMarker>
      ))}

      {/* 🚆 MARTA Markers */}
      {commuteMode === "MARTA" && STATIONS.map((station, i) => (
        <CircleMarker
          key={i}
          center={station.coords}
          radius={8}
          pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.8 }}
        >
          <Popup><strong>{station.name} Station</strong></Popup>
        </CircleMarker>
      ))}

      {userPosition && (
        <CircleMarker center={userPosition} radius={6} pathOptions={{ color: "red" }}>
          <Popup>You</Popup>
        </CircleMarker>
      )}
    </MapContainer>
  );
}
