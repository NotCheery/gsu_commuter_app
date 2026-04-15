// axios logic here for marta
import axios from 'axios';
import * as GtfsRealtimeBindings from 'gtfs-realtime-bindings';

// The URL for MARTA's Realtime Rail API
const MARTA_RAIL_URL = 'https://developerservices.itsmarta.com:18096/itsmarta/railrealtimearrivals/developerservices/traindata?apiKey=8bdbd08b-a850-4d78-bc1a-e20257476b6f'

export interface MartaTrain {
  DESTINATION: string;
  DIRECTION: string;
  EVENT_TIME: string;
  LINE: string;
  NEXT_ARR: string;
  STATION: string;
  TRAIN_ID: string;
  WAITING_SECONDS: string;
  WAITING_TIME: string;
}

// The Live GTFS URL
const MARTA_GTFS_PB_URL = 'https://gtfs-rt.itsmarta.com/TMGTFSRealTimeWebService/vehicle/vehiclepositions.pb';

// Interface
export interface MartaBus {
  ADHERENCE: string;
  BLOCKID: string;
  BLOCK_ABBR: string;
  DIRECTION: string;
  LATITUDE: string;
  LONGITUDE: string;
  MSGTIME: string;
  ROUTE: string;
  STOPID: string;
  TIMEPOINT: string;
  TRIPID: string;
  VEHICLE: string;
  VEHICLE_ID: string;
}

export const getRealtimeBusData = async (routeNumber: string) => {
  try {
    const response = await axios.get(MARTA_GTFS_PB_URL, {
      responseType: 'arraybuffer',
      timeout: 10000, // 10 second timeout
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(response.data)
    );

    const filteredBuses = feed.entity
      .filter(entity => entity.vehicle && entity.vehicle.trip)
      .map((entity) => {
        const v = entity.vehicle!;
        return {
          ROUTE: v.trip?.routeId || "Unknown",
          LATITUDE: String(v.position?.latitude || "0"),
          LONGITUDE: String(v.position?.longitude || "0"),
          VEHICLE_ID: v.vehicle?.id || "Unknown",
          ADHERENCE: "0",
          BLOCKID: "", BLOCK_ABBR: "", DIRECTION: "", MSGTIME: "", STOPID: "", TIMEPOINT: "", TRIPID: "", VEHICLE: ""
        };
      })
      .filter(bus => 
        String(bus.ROUTE).includes(String(routeNumber))
      );

    return filteredBuses;
  } catch (error) {
    console.error("❌ GTFS Error:", error instanceof Error ? error.message : error);
    return [];
  }
};

export const getRealtimeTrainData = async (stationName: string) => {
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await axios.get<MartaTrain[]>(MARTA_RAIL_URL, {
                timeout: 10000 // 10 second timeout
            });
            const allTrains = response.data;

            console.log(`[MARTA] Attempt ${attempt}: Successfully fetched ${allTrains.length} trains for "${stationName}"`);
            
            // Normalize search term: uppercase and remove extra spaces
            const searchTerm = stationName.toUpperCase().trim();
            
            // Filter with EXACT matching:
            // Match if station is exactly the search term, or search term + " STATION", or " STATION" + search term
            const filtered = allTrains.filter((train) => {
                const station = train.STATION.toUpperCase().trim();
                
                // Exact match
                if (station === searchTerm) return true;
                
                // Match with " STATION" suffix
                if (station === `${searchTerm} STATION`) return true;
                
                // Match if search term is contained but followed by " STATION" or end of string
                const searchRegex = new RegExp(`^${searchTerm}(\\s+STATION)?$`);
                if (searchRegex.test(station)) return true;
                
                return false;
            });

            console.log(`[MARTA] Found ${filtered.length} trains matching "${stationName}"`);
            return filtered;
        } catch (error) {
            lastError = error;
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.warn(`[MARTA] Attempt ${attempt}/${maxRetries} failed: ${errorMsg}`);
            
            // If we have more retries, wait before trying again
            if (attempt < maxRetries) {
                const delayMs = 500 * attempt;
                console.log(`[MARTA] Retrying in ${delayMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }

    console.error(`[MARTA] Failed to fetch train data for "${stationName}" after ${maxRetries} attempts`);
    return [];
}