"use client";

import { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- CUSTOM ICON GENERATOR ---
// This creates beautiful circular markers with emojis inside
const createCustomIcon = (emoji: string, color: string): L.DivIcon => {
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      font-size: 18px;
    ">${emoji}</div>`,
    className: "custom-marker",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

// --- ICON DEFINITIONS ---
const icons = {
  parking: createCustomIcon("🅿️", "#16a34a"), // Green for Decks
  train: createCustomIcon("🚆", "#2563eb"),   // Blue for Trains
  bus: createCustomIcon("🚌", "#f59e0b"),     // Orange for Buses
  user: createCustomIcon("📍", "#ef4444"),    // Red for User
};

// --- MAP AUTO-CENTER HELPER ---
function MapFocus({ targetCoords }: { targetCoords?: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (targetCoords) {
      // Leaflet uses [lat, lng]
      map.flyTo([targetCoords[1], targetCoords[0]], 15, { duration: 1.5 });
    }
  }, [targetCoords, map]);
  return null;
}

interface TrainStation {
  name: string;
  coords: string;
  line: string;
}

interface BusStop {
  name: string;
  coords: string;
  routes: string[];
}

interface CampusMapProps {
  commuteMode: "CAR" | "TRAIN" | "BUS";
  routePath?: [number, number][];
  trainData?: TrainStation[];
  busData?: BusStop[];
}

export default function CampusMap({
  commuteMode,
  routePath,
  trainData = [],
  busData = []
}: CampusMapProps) {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

  // Hardcoded Parking Decks (Coordinates in [lat, lng] for Leaflet)
  const PARKING_DECKS: Array<{ name: string; coords: [number, number] }> = [
    { name: "T Deck", coords: [33.755135, -84.386687] },
    { name: "M Deck", coords: [33.753237, -84.383996] },
    { name: "G Deck", coords: [33.751995, -84.387549] },
    { name: "N Deck", coords: [33.7560, -84.3855] },
    { name: "Campus Center Deck", coords: [33.7537, -84.3863] },
    { name: "Convocation Center Lot", coords: [33.7420, -84.3895] }
  ];

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
        () => console.warn("Location access denied.")
      );
    }
  }, []);

  // Determine the "Focus" point (the end of the current route)
  const destination = useMemo(() => {
    if (routePath && routePath.length > 0) {
      return routePath[routePath.length - 1]; // Returns [lng, lat]
    }
    return null;
  }, [routePath]);

  return (
    <MapContainer 
      center={[33.7537, -84.3863]} 
      zoom={15} 
      style={{ height: "100%", width: "100%",filter: "grayscale(20%) brightness(105%)", borderRadius: "0 0 0 40px" }}
    >
      <TileLayer 
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
      />
      
      <MapFocus targetCoords={destination} />

      {/* 📍 USER LOCATION */}
      {userPosition && (
        <Marker position={userPosition} icon={icons.user}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {/* 🛣️ ROUTE LINE */}
      {routePath && (
        <Polyline 
          positions={routePath.map(c => [c[1], c[0]])} 
          pathOptions={{ 
            color: commuteMode === 'CAR' ? '#2563eb' : '#2563eb', 
            weight: 6, 
            opacity: 0.7,
            lineJoin: 'round'
          }} 
        />
      )}

      {/* 🚗 PARKING DECKS (Only show in CAR mode) */}
      {commuteMode === "CAR" && PARKING_DECKS.map((deck, i) => (
        <Marker key={`deck-${i}`} position={deck.coords} icon={icons.parking}>
          <Popup><strong>{deck.name}</strong></Popup>
        </Marker>
      ))}

      {/* 🚆 TRAIN STATIONS (Always searchable/visible in TRAIN mode) */}
      {commuteMode === "TRAIN" && trainData.map((station, i) => {
        const coords = station.coords.split(",").map(Number);
        return (
          <Marker key={`train-${i}`} position={[coords[1], coords[0]]} icon={icons.train}>
            <Popup><strong>{station.name} Station</strong><br/>{station.line} Line</Popup>
          </Marker>
        );
      })}

      {/* 🚌 BUS STOPS (Always searchable/visible in BUS mode) */}
      {commuteMode === "BUS" && busData.map((bus, i) => {
        const coords = bus.coords.split(",").map(Number);
        return (
          <Marker key={`bus-${i}`} position={[coords[1], coords[0]]} icon={icons.bus}>
            <Popup><strong>{bus.name}</strong><br/>Routes: {bus.routes?.join(", ")}</Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}