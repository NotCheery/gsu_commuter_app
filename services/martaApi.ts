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
}

export const getRealtimeBusData = async (routeNumber: string) => {
  try {
    // 1. Fetch the data as binary buffer
    const response = await axios.get(MARTA_GTFS_PB_URL, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0',
      }
    });

    // 2. Decode the binary data
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(response.data)
    );

    // 3. Extract info safely
    const allBuses = feed.entity.map((entity) => {
      // Check if vehicle data exists
      if (entity.vehicle) {
        return {
          // Use ?. to safely access nested properties
          ROUTE: entity.vehicle.trip?.routeId || "Unknown",
          
          // Convert numbers to strings to match your Interface
          LATITUDE: String(entity.vehicle.position?.latitude || "0"),
          LONGITUDE: String(entity.vehicle.position?.longitude || "0"),
          
          VEHICLE_ID: entity.vehicle.vehicle?.id || "Unknown",
          ADHERENCE: "0",
          
          // Fill generic fields to satisfy TypeScript
          BLOCKID: "", BLOCK_ABBR: "", DIRECTION: "", MSGTIME: "", STOPID: "", TIMEPOINT: "", TRIPID: "", VEHICLE: ""
        };
      }
      return null;
    }).filter(bus => bus !== null);

    // 4. Filter by Route (convert both to strings to be safe)
    const filteredBuses = allBuses.filter(bus => 
        String(bus.ROUTE) === String(routeNumber)
    );

    console.log(`🚌 Found ${filteredBuses.length} buses for route ${routeNumber}`);
    
    return filteredBuses;

  } catch (error) {
    console.error("❌ Error decoding GTFS file:", error);
    return [];
  }
};

export const getRealtimeTrainData = async (stationName: string) => {
    try {
        const response = await axios.get<MartaTrain[]>(MARTA_RAIL_URL);
        const allTrains = response.data;

        
        // filter for specific stations
        const filteredTrains = allTrains.filter((train) =>
            train.STATION.toUpperCase() === stationName.toUpperCase() + " STATION"
        );
        return filteredTrains;
    } catch (error) {
        console.error("Error fetching MARTA data:", error);
        return []; //return empty array so app doesn't crash.
    }
   
}
