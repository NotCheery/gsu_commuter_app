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

// Sample parking decks (used as default before API is ready)
//FIXME: UPDATE COORDINATES AND PUT ACTUAL STUDENT DECKS
const sampleParkingDecks = [
  { id: 1, name: "T Deck", coordinates: [33.755135, -84.386687], availability: 60 },
  { id: 2, name: "M Deck", coordinates: [33.753237, -84.383996], availability: 25 },
  { id: 3, name: "K Deck", coordinates: [33.7565, -84.3842], availability: 40 },
  { id: 4, name: "N Deck", coordinates: [33.7560, -84.3855], availability: 50 },
  { id: 5, name: "G Deck", coordinates: [33.751995, -84.387549], availability: 80 }
];

// Color code function
const getColor = (availability) => {
  if (availability > 50) return "green";
  if (availability > 20) return "orange";
  return "red";
};

// Recenter map to user location
function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 16);
  }, [position, map]);
  return null;
}

export default function CampusMap() {
  const [userPosition, setUserPosition] = useState(null);
  const [parkingDecks, setParkingDecks] = useState(sampleParkingDecks);
  const [martaRoutes, setMartaRoutes] = useState([]);
  const [commuteOption, setCommuteOption] = useState("car");
  const [map, setMap] = useState(null);

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
      () => alert("Unable to get your location")
    );
  }, []);

  // Fetch dynamic parking deck data (once your API is ready)
  useEffect(() => {
    async function fetchParkingData() {
      try {
        const response = await fetch("/api/parking"); // placeholder
        const data = await response.json();
        if (data && data.length > 0) setParkingDecks(data);
      } catch (error) {
        console.error("Error fetching parking data:", error);
      }
    }
    // Comment out if API isn't ready yet
    // fetchParkingData();
  }, []);

  // Fetch MARTA routes dynamically when selected
  useEffect(() => {
    if (commuteOption !== "marta") return;

    async function fetchMartaRoutes() {
      try {
        const response = await fetch("/api/marta"); // placeholder
        const data = await response.json();
        if (data.routes) setMartaRoutes(data.routes);
      } catch (error) {
        console.error("Error fetching MARTA routes:", error);
      }
    }
    // Comment out if API isn't ready yet
    // fetchMartaRoutes();
  }, [commuteOption]);

  // Zoom to a deck when clicked from the side panel
  const zoomToDeck = (coordinates) => {
    if (map) map.setView(coordinates, 18);
  };

  return (
    <div className="map-container">
      <div className="side-panel">
        <h2>Commute Options</h2>
        <div>
          <label>
            <input
              type="radio"
              name="commute"
              value="car"
              checked={commuteOption === "car"}
              onChange={(e) => setCommuteOption(e.target.value)}
            />
            Car
          </label>
          <label style={{ marginLeft: "10px" }}>
            <input
              type="radio"
              name="commute"
              value="marta"
              checked={commuteOption === "marta"}
              onChange={(e) => setCommuteOption(e.target.value)}
            />
            MARTA
          </label>
        </div>

        <h2>Parking Decks</h2>
        <ul>
          {parkingDecks.map((deck) => (
            <li
              key={deck.id}
              onClick={() => zoomToDeck(deck.coordinates)}
              style={{ cursor: "pointer" }}
            >
              <span
                className="availability-dot"
                style={{ backgroundColor: getColor(deck.availability) }}
              ></span>
              {deck.name}: {deck.availability} spots
            </li>
          ))}
        </ul>
      </div>

      <MapContainer
        center={campusCenter}
        zoom={16}
        style={{ height: "600px", width: "100%" }}
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
            <Polyline key={i} positions={route} pathOptions={{ color: "red" }} />
          ))}
      </MapContainer>
    </div>
  );
}


FIXME UPDATE PARKING LOT COORDINATES AND SEE IF ARCGIS MAP OVERLAY IS BENEFICIAL WITH MAP