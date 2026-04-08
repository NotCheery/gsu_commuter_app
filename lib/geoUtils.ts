/**
 * Geofencing utilities for finding nearby stations/parking
 */

export interface Location {
  lat: number;
  lng: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
export const calculateDistance = (
  from: Location,
  to: Location
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Find stations within a given radius from user location
 */
export const findNearbyStations = <T extends { coords: string }>(
  stations: T[],
  userLocation: Location,
  radiusMiles: number = 1
): T[] => {
  return stations
    .map((station) => {
      const [lng, lat] = station.coords.split(",").map(Number);
      const distance = calculateDistance(userLocation, { lat, lng });
      return { ...station, distance };
    })
    .filter((station) => station.distance <= radiusMiles)
    .sort((a, b) => a.distance - b.distance);
};
