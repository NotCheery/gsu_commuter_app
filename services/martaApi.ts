// axios logic here for marta
import axios from 'axios';

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

// 1. Add the Bus URL
const MARTA_BUS_URL = 'http://developer.itsmarta.com/BRDRestService/RestBusRealTimeService/GetAllBus';

// 2. Define the Bus Interface (MARTA gives different info for buses)
export interface MartaBus {
  ADHERENCE: string; // "0" means on time, "-1" means 1 min late
  BLOCKID: string;
  BLOCK_ABBR: string;
  DIRECTION: string;
  LATITUDE: string;
  LONGITUDE: string;
  MSGTIME: string;
  ROUTE: string;     // e.g. "816"
  STOPID: string;
  TIMEPOINT: string; // The next main stop
  TRIPID: string;
  VEHICLE: string;
}

// 3. Add the Fetch Function
export const getRealtimeBusData = async (routeNumber: string) => {
  try {
    const response = await axios.get<MartaBus[]>(MARTA_BUS_URL);
    const allBuses = response.data;

    // Filter by Route Number (e.g., "816")
    const filteredBuses = allBuses.filter((bus) => 
      bus.ROUTE === routeNumber
    );

    return filteredBuses;

  } catch (error) {
    console.error("Error fetching MARTA Bus data:", error);
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
