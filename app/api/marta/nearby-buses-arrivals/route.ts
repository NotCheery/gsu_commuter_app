import { NextResponse } from "next/server";
import axios from 'axios';
import * as GtfsRealtimeBindings from 'gtfs-realtime-bindings';

const MARTA_GTFS_PB_URL = 'https://gtfs-rt.itsmarta.com/TMGTFSRealTimeWebService/vehicle/vehiclepositions.pb';
const STATIC_GTFS_URL = 'https://cobbdot.com/sites/default/files/GTFS_Feed.zip'; // Generic GTFS for stop info

// Simple distance calculation (Haversine formula)
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Radius of Earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const radius = parseFloat(searchParams.get('radius') || '1');

  if (lat === 0 || lng === 0) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  try {
    const response = await axios.get(MARTA_GTFS_PB_URL, {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(response.data)
    );

    // Extract all vehicles with their positions and routes
    const vehicles = feed.entity
      .filter(entity => entity.vehicle && entity.vehicle.trip && entity.vehicle.position)
      .map((entity) => {
        const v = entity.vehicle!;
        const vehicleLat = v.position?.latitude || 0;
        const vehicleLng = v.position?.longitude || 0;
        const distance = getDistance(lat, lng, vehicleLat, vehicleLng);
        
        return {
          routeId: v.trip?.routeId || "Unknown",
          stopId: v.trip?.scheduleRelationship || "",
          latitude: vehicleLat,
          longitude: vehicleLng,
          vehicleId: v.vehicle?.id || "Unknown",
          distance,
          // Estimate ETA in minutes (rough estimate: distance / avg speed)
          // Average bus speed ~12 mph in city
          eta: Math.round((distance / 12) * 60), // Convert to minutes
        };
      })
      .filter(v => v.distance <= radius) // Filter by radius
      .sort((a, b) => a.distance - b.distance); // Sort by distance

    // Group vehicles by route and get the nearest bus for each route
    const routeMap: Record<string, any> = {};
    vehicles.forEach(vehicle => {
      if (!routeMap[vehicle.routeId]) {
        routeMap[vehicle.routeId] = vehicle;
      } else if (vehicle.distance < routeMap[vehicle.routeId].distance) {
        routeMap[vehicle.routeId] = vehicle;
      }
    });

    // Convert to array and sort by ETA
    const nearestBuses = Object.values(routeMap)
      .sort((a: any, b: any) => a.eta - b.eta)
      .slice(0, 5); // Return top 5 nearest buses

    return NextResponse.json(nearestBuses);
  } catch (error) {
    console.error("❌ Bus Arrivals Error:", error);
    return NextResponse.json([], { status: 200 }); // Return empty array on error
  }
}
