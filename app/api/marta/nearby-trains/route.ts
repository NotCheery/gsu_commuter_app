import { NextResponse } from "next/server";
import { getRealtimeTrainData, MartaTrain } from "@/services/martaApi";

/**
 * MARTA Train Stations with their coordinates
 */
const MARTA_TRAIN_STATIONS = [
  { name: "Five Points", coords: "-84.3915,33.7525", line: "Red, Gold, Blue" },
  { name: "Georgia State", coords: "-84.3853,33.7537", line: "Red, Gold" },
  { name: "Peachtree Center", coords: "-84.3876,33.7599", line: "Red, Gold" },
  { name: "Decatur", coords: "-84.3730,33.7749", line: "Red, Gold, Blue" },
  { name: "Midtown", coords: "-84.3883,33.7895", line: "Red, Gold" },
  { name: "Civic Center", coords: "-84.3913,33.7621", line: "Red, Gold" },
  { name: "West End", coords: "-84.4174,33.7479", line: "Gold" },
  { name: "Edgewood", coords: "-84.3743,33.7508", line: "Blue" },
  { name: "King Memorial", coords: "-84.3732,33.7486", line: "Blue" },
  { name: "East Point", coords: "-84.4489,33.6613", line: "Gold" },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userLat = parseFloat(searchParams.get("lat") || "33.7537");
  const userLng = parseFloat(searchParams.get("lng") || "-84.3863");
  const radiusMiles = parseFloat(searchParams.get("radius") || "3"); // Increased from 1.5 to 3 miles

  try {
    // Calculate distances for all stations
    const stationsWithDistance = MARTA_TRAIN_STATIONS.map((station) => {
      const [sLng, sLat] = station.coords.split(",").map(Number);
      const dLat = ((sLat - userLat) * Math.PI) / 180;
      const dLng = ((sLng - userLng) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((userLat * Math.PI) / 180) *
          Math.cos((sLat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = 3959 * c; // Earth radius in miles

      return { ...station, distance };
    })
      .sort((a, b) => a.distance - b.distance);

    // Filter by radius, but if no stations found, include the 3 nearest
    let nearbyStations = stationsWithDistance.filter((station) => station.distance <= radiusMiles);
    if (nearbyStations.length === 0) {
      console.log(`No stations within ${radiusMiles} miles. Showing 3 nearest stations.`);
      nearbyStations = stationsWithDistance.slice(0, 3);
    }

    // Fetch real-time data for each nearby station
    const stationsWithArrivals = await Promise.all(
      nearbyStations.map(async (station) => {
        try {
          const arrivals = await getRealtimeTrainData(station.name);
          return {
            ...station,
            arrivals: arrivals.slice(0, 3), // Get top 3 upcoming trains
          };
        } catch (error) {
          console.error(`Error fetching data for ${station.name}:`, error);
          return { ...station, arrivals: [] };
        }
      })
    );

    return NextResponse.json(stationsWithArrivals);
  } catch (error) {
    console.error("Error in nearby trains endpoint:", error);
    return NextResponse.json(
      { error: "Failed to fetch nearby stations" },
      { status: 500 }
    );
  }
}
