import { NextResponse } from "next/server";
import { getRealtimeBusData } from "@/services/martaApi";

/**
 * Common MARTA Bus Stops near GSU campus with their coordinates
 */
const MARTA_BUS_STOPS = [
  {
    name: "Courtland St & Gilmer St",
    coords: "-84.3855,33.7558",
    routes: ["40", "816"],
  },
  {
    name: "Piedmont Ave & Auburn Ave",
    coords: "-84.3842,33.7548",
    routes: ["816", "12", "40"],
  },
  {
    name: "Peachtree Center Ave & John Wesley Dobbs",
    coords: "-84.3858,33.7583",
    routes: ["110", "40"],
  },
  {
    name: "Decatur St & Central Ave",
    coords: "-84.3881,33.7531",
    routes: ["21", "42", "40"],
  },
  {
    name: "Auburn Ave & Hilliard St",
    coords: "-84.3815,33.7495",
    routes: ["12", "40", "123"],
  },
  {
    name: "Capitol Ave & Mitchell St",
    coords: "-84.3921,33.7521",
    routes: ["15", "40"],
  },
  {
    name: "Park Center Dr",
    coords: "-84.3863,33.7537",
    routes: ["21", "40", "110"],
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userLat = parseFloat(searchParams.get("lat") || "33.7537");
  const userLng = parseFloat(searchParams.get("lng") || "-84.3863");
  const radiusMiles = parseFloat(searchParams.get("radius") || "1");

  try {
    // Calculate distances and filter nearby stops
    const nearbyStops = MARTA_BUS_STOPS.map((stop) => {
      const [sLng, sLat] = stop.coords.split(",").map(Number);
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

      return { ...stop, distance };
    })
      .filter((stop) => stop.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance);

    // Fetch real-time data for each route at this stop
    const stopsWithBuses = await Promise.all(
      nearbyStops.map(async (stop) => {
        try {
          const buses = await Promise.all(
            stop.routes.map(async (route) => {
              const vehicleData = await getRealtimeBusData(route);
              return {
                route,
                vehicles: vehicleData.slice(0, 2), // Get top 2 vehicles per route
              };
            })
          );

          return {
            ...stop,
            buses,
          };
        } catch (error) {
          console.error(`Error fetching buses for ${stop.name}:`, error);
          return { ...stop, buses: [] };
        }
      })
    );

    return NextResponse.json(stopsWithBuses);
  } catch (error) {
    console.error("Error in nearby buses endpoint:", error);
    return NextResponse.json(
      { error: "Failed to fetch nearby bus stops" },
      { status: 500 }
    );
  }
}
