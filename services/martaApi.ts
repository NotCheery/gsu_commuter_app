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
    const response = await axios.get(MARTA_GTFS_PB_URL, {
      responseType: 'arraybuffer',
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
          ADHERENCE: "0", // GTFS-RT usually doesn't have adherence; you'd need the REST API for that
          BLOCKID: "", BLOCK_ABBR: "", DIRECTION: "", MSGTIME: "", STOPID: "", TIMEPOINT: "", TRIPID: "", VEHICLE: ""
        };
      })
      .filter(bus => 
        // 👈 FIX: Check if the route ID contains the number (e.g., "110" in "0110")
        String(bus.ROUTE).includes(String(routeNumber))
      );

    return filteredBuses;
  } catch (error) {
    console.error("❌ GTFS Error:", error);
    return [];
  }
};

export const getRealtimeTrainData = async (stationName: string) => {
    try {
        const response = await axios.get<MartaTrain[]>(MARTA_RAIL_URL);
        const allTrains = response.data;

        return allTrains.filter((train) =>
            // 👈 FIX: Use .includes() so it works whether " STATION" is there or not
            train.STATION.toUpperCase().includes(stationName.toUpperCase())
        );
    } catch (error) {
        return [];
    }
}