"use client";

import { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "./CampusMap.css";

/* ---------------------------
   Fix Leaflet default marker icons
   (Leaflet requires manual icon setup in React/Next)
---------------------------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
});

/* ---------------------------
   Map center (GSU campus)
---------------------------- */
const CAMPUS_CENTER = [33.753746, -84.38633];

/* ---------------------------
   Parking decks (static data)
---------------------------- */
const PARKING_DECKS = [
  { id: 1, name: "T Deck", coords: [33.755135, -84.386687], availability: 60 },
  { id: 2, name: "M Deck", coords: [33.753237, -84.383996], availability: 25 },
  { id: 3, name: "K Deck", coords: [33.7565, -84.3842], availability: 40 },
  { id: 4, name: "N Deck", coords: [33.7560, -84.3855], availability: 50 },
  { id: 5, name: "G Deck", coords: [33.751995, -84.387549], availability: 80 }
];

/* ---------------------------
   MARTA stations with coordinates
---------------------------- */
const STATIONS = [
  { name: "Georgia State", coords: [33.7537, -84.3853] },
  { name: "Five Points", coords: [33.7525, -84.3915] },
  { name: "Peachtree Center", coords: [33.7599, -84.3876] }
];

/* ---------------------------
   Helper: Recenter map on user location
---------------------------- */
function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 16);
    }
  }, [position, map]);

  return null;
}

/* ---------------------------
   Main Map Component
---------------------------- */
export default function CampusMap({ commuteMode }) {
  const [map, setMap] = useState(null);

  // Real-time MARTA data
  const [trainData, setTrainData] = useState([]);
  const [busData, setBusData] = useState([]);

  // User GPS location
  const [userPosition, setUserPosition] = useState(null);

  /* ---------------------------
     Get user's location
  ---------------------------- */
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      () => console.warn("Location not available")
    );
  }, []);

  /* ---------------------------
     Fetch MARTA data when in MARTA mode
  ---------------------------- */
  useEffect(() => {
    if (commuteMode !== "MARTA") return;

    const fetchData = async () => {
      try {
        // Fetch train + bus data in parallel
        const [trainRes, busRes] = await Promise.all([
          fetch("/api/marta?station=Georgia State"),
          fetch("/api/marta?route=110")
        ]);

        const trainJson = await trainRes.json();
        const busJson = await busRes.json();

        setTrainData(trainJson || []);
        setBusData(busJson || []);
      } catch (err) {
        console.error("MARTA fetch error:", err);
      }
    };

    fetchData();
  }, [commuteMode]);

  /* ---------------------------
     Convert bus coordinates into usable format
  ---------------------------- */
  const validBuses = useMemo(() => {
    return busData
      .map((bus) => {
        const lat = parseFloat(bus.LATITUDE);
        const lng = parseFloat(bus.LONGITUDE);
        if (isNaN(lat) || isNaN(lng)) return null;
        return { ...bus, coords: [lat, lng] };
      })
      .filter(Boolean);
  }, [busData]);

  /* ---------------------------
     Zoom helper when clicking parking
  ---------------------------- */
  const zoomTo = (coords) => {
    if (map) map.setView(coords, 18);
  };

  return (
    <MapContainer
      center={CAMPUS_CENTER}
      zoom={16}
      style={{ height: "100%", width: "100%" }}
      whenCreated={setMap}
    >
      {/* Base map tiles */}
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* ---------------------------
          Parking markers (always visible)
      ---------------------------- */}
      {PARKING_DECKS.map((deck) => (
        <CircleMarker
          key={deck.id}
          center={deck.coords}
          radius={10}
          pathOptions={{ color: "green" }}
          eventHandlers={{
            click: () => zoomTo(deck.coords)
          }}
        >
          <Popup>
            <strong>{deck.name}</strong>
            <br />
            Available: {deck.availability}
          </Popup>
        </CircleMarker>
      ))}

      {/* ---------------------------
          MARTA Stations + Train Info
      ---------------------------- */}
      {commuteMode === "MARTA" &&
        STATIONS.map((station, i) => {
          // Match trains belonging to this station
          const stationTrains = trainData.filter((train) =>
            train.STATION?.toLowerCase().includes(station.name.toLowerCase())
          );

          return (
            <CircleMarker
              key={i}
              center={station.coords}
              radius={8}
              pathOptions={{ color: "blue" }}
            >
              <Popup>
                <strong>{station.name}</strong>
                <hr />

                {stationTrains.length > 0 ? (
                  stationTrains.slice(0, 3).map((train, idx) => (
                    <div key={idx}>
                      🚄 {train.DESTINATION}
                      <br />
                      ⏱ {train.NEXT_ARR}
                      <hr />
                    </div>
                  ))
                ) : (
                  "No train data"
                )}
              </Popup>
            </CircleMarker>
          );
        })}

      {/* ---------------------------
          Live bus markers
      ---------------------------- */}
      {commuteMode === "MARTA" &&
        validBuses.map((bus, i) => (
          <CircleMarker
            key={i}
            center={bus.coords}
            radius={6}
            pathOptions={{ color: "orange" }}
          >
            <Popup>
              Route {bus.ROUTE}
              <br />
              {bus.ADHERENCE === "0"
                ? "On Time"
                : `${bus.ADHERENCE} min late`}
            </Popup>
          </CircleMarker>
        ))}

      {/* ---------------------------
          User location marker
      ---------------------------- */}
      {userPosition && (
        <>
          <CircleMarker
            center={userPosition}
            radius={10}
            pathOptions={{ color: "blue" }}
          >
            <Popup>You are here</Popup>
          </CircleMarker>

          {/* Auto recenter map */}
          <RecenterMap position={userPosition} />
        </>
      )}
    </MapContainer>
  );
}
