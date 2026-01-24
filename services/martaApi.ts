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