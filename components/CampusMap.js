import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "./CampusMap.css";

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
});

// Campus center
const campusCenter = [33.753746, -84.386330];

// Sample parking decks
const sampleParkingDecks = [
  { id: 1, name: "T Deck", coordinates: [33.755135, -84.386687], availability: 60 },
  { id: 2, name: "M Deck", coordinates: [33.753237, -84.383996], availability: 25 },
  { id: 3, name: "K Deck", coordinates: [33.7565, -84.3842], availability: 40 },
  { id: 4, name: "N Deck", coordinates: [33.7560, -84.3855], availability: 50 },
  { id: 5, name: "G Deck", coordinates: [33.751995, -84.387549], availability: 80 }
];

// Color coding
const getColor = (availability) => {
  if (availability > 50) return "green";
  if (availability > 20) return "orange";
  return "red";
};

// Recenter map to user location
function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 16);
    }
  }, [position, map]);
  return null;
}

export default function CampusMap() {
  const [userPosition, setUserPosition] = useState(null);
  const [parkingDecks, setParkingDecks] = useState(sampleParkingDecks);
  const [martaRoutes, setMartaRoutes] = useState([]);
  const [commuteOption, setCommuteOption] = useState("car");
  const [map, setMap] = useState(null);

  // ✅ Force map re-render (fixes missing tile alignment)
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMapKey((prev) => prev + 1);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // ✅ Extra safeguard: invalidate size after mount
  useEffect(() => {
    if (!map) return;

    const timer = setTimeout(() => {
      map.invalidateSize(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [map]);

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserPosition([pos.coords.latitude, pos.coords.longitude]),
      () => alert("Unable to get your location")
    );
  }, []);

  // Parking API placeholder
  useEffect(() => {
    async function fetchParkingData() {
      try {
        const response = await fetch("/api/parking");
        const data = await response.json();
        if (data && data.length > 0) setParkingDecks(data);
      } catch (error) {
        console.error("Error fetching parking data:", error);
      }
    }
    // fetchParkingData();
  }, []);

  // MARTA API placeholder
  useEffect(() => {
    if (commuteOption !== "marta") return;

    async function fetchMartaRoutes() {
      try {
        const response = await fetch("/api/marta");
        const data = await response.json();
        if (data.routes) setMartaRoutes(data.routes);
      } catch (error) {
        console.error("Error fetching MARTA routes:", error);
      }
    }
    // fetchMartaRoutes();
  }, [commuteOption]);

  const zoomToDeck = (coordinates) => {
    if (map) {
      map.setView(coordinates, 18);
    }
  };

  return (
    <div style={{ display: "flex", height: "100%", width: "100%" }}>

      {/* Sidebar */}
      <div className="side-panel" style={{ width: "300px", overflowY: "auto" }}>
        <h2>Commute Options</h2>

        <div>
          <label>
            <input
              type="radio"
              value="car"
              checked={commuteOption === "car"}
              onChange={(e) => setCommuteOption(e.target.value)}
            />
            Car
          </label>

          <label style={{ marginLeft: "10px" }}>
            <input
              type="radio"
              value="marta"
              checked={commuteOption === "marta"}
              onChange={(e) => setCommuteOption(e.target.value)}
            />
            MARTA
          </label>
        </div>

        <h3>Parking Decks</h3>
        <ul>
          {parkingDecks.map((deck) => (
            <li
              key={deck.id}
              onClick={() => zoomToDeck(deck.coordinates)}
              style={{ cursor: "pointer" }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: getColor(deck.availability),
                  marginRight: "8px"
                }}
              />
              {deck.name} ({deck.availability})
            </li>
          ))}
        </ul>
      </div>

      {/* Map */}
      <div style={{ flex: 1, height: "100%" }}>
        
        {mapKey > -1 && (
          <MapContainer
            key={mapKey}   // ✅ forces clean remount
            center={campusCenter}
            zoom={16}
            style={{ height: "100%", width: "100%" }}
            whenCreated={setMap}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {parkingDecks.map((deck) => (
              <CircleMarker
                key={deck.id}
                center={deck.coordinates}
                radius={10}
                pathOptions={{ color: getColor(deck.availability) }}
              >
                <Popup>
                  <strong>{deck.name}</strong>
                  <br />
                  Available Spots: {deck.availability}
                </Popup>
              </CircleMarker>
            ))}

            {userPosition && (
              <>
                <CircleMarker
                  center={userPosition}
                  radius={10}
                  pathOptions={{ color: "blue" }}
                >
                  <Popup>You are here</Popup>
                </CircleMarker>

                <RecenterMap position={userPosition} />
              </>
            )}

            {commuteOption === "marta" &&
              martaRoutes.map((route, i) => (
                <Polyline
                  key={i}
                  positions={route}
                  pathOptions={{ color: "red" }}
                />
              ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}