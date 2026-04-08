import { useState, useEffect } from "react";

export interface NearbyTrain {
  name: string;
  coords: string;
  line: string;
  distance: number;
  arrivals: any[];
}

export interface NearbyBusStop {
  name: string;
  coords: string;
  routes: string[];
  distance: number;
  buses: any[];
}

/**
 * Hook to fetch nearby MARTA trains based on user location
 */
export const useNearbyTrains = (userLocation: { lat: number; lng: number } | null) => {
  const [trains, setTrains] = useState<NearbyTrain[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLocation) return;

    const fetchNearbyTrains = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/marta/nearby-trains?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=3`
        );
        if (!response.ok) throw new Error("Failed to fetch nearby trains");
        const data = await response.json();
        setTrains(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Error fetching nearby trains:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyTrains();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchNearbyTrains, 30000);
    return () => clearInterval(interval);
  }, [userLocation]);

  return { trains, loading, error };
};

/**
 * Hook to fetch nearby MARTA bus stops based on user location
 */
export const useNearbyBuses = (userLocation: { lat: number; lng: number } | null) => {
  const [buses, setBuses] = useState<NearbyBusStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLocation) return;

    const fetchNearbyBuses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/marta/nearby-buses?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=1`
        );
        if (!response.ok) throw new Error("Failed to fetch nearby buses");
        const data = await response.json();
        setBuses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Error fetching nearby buses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyBuses();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchNearbyBuses, 30000);
    return () => clearInterval(interval);
  }, [userLocation]);

  return { buses, loading, error };
};
