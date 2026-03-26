"use client"; //tells Next.js to run in browser, not server

import { useEffect, useState } from "react";
import axios from 'axios';

// define shape for our data
interface Train {
    STATION : string;
    NEXT_ARR: string;
    DESTINATION: string;
}
interface Bus {
  ROUTE: string;
  LATITUDE: string;
  LONGITUDE: string;
  ADHERENCE: string; // "0" means on time, "-1" means 1 min latE
}

export default function MartaDebugger() {
    const [trains, setTrains] = useState<Train[]>([]);
    const [buses, setBuses] = useState<Bus[]>([]);
    const [lastUpdated, setLastUpdated] = useState<string>("Never");

    const fetchData = async () => {
        try {
            console.log("🚄 Fetching fresh MARTA data...");

            //  Fetch train data (filtered to Georgia State Station for now)
            const trainResponse = await axios.get('/api/marta?station=Georgia+State');
            setTrains(trainResponse.data)

            // Fetch bus data (filtered to Route 816 for now b/c it is a reliable GSU route)
            const busResponse = await axios.get('/api/marta?route=816');
            setBuses(busResponse.data)

            // update timestamp
            setLastUpdated(new Date().toLocaleTimeString());

            console.log("✅ Data received:", { trains: trainResponse.data, buses: busResponse.data });

        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    };
    //Lifecycle hook
    useEffect(() => {
        // fetch immediately when page loads
        fetchData();

        // fetch every 60 seconds (60000 ms)
        const intervalId = setInterval (fetchData, 60000);

        // if user leaves page, stop the timer to prevent app from crashing or slowing down
        return () => clearInterval(intervalId);
    }, []);

    // simple ui to show it's working
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 m-4">
            
            {/* LEFT COLUMN: TRAINS */}
            <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
                <h2 className="font-bold text-xl text-blue-800">🚄 Trains (GSU Station)</h2>
                <p className="text-sm text-gray-600 mb-2">Last Updated: {lastUpdated}</p>
                
                <div className="mt-2 text-sm font-mono bg-white p-2 rounded max-h-60 overflow-auto">
                    {trains.length === 0 ? (
                        <p className="text-gray-500">No trains found...</p>
                    ) : (
                        <pre>{JSON.stringify(trains, null, 2)}</pre>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: BUSES */}
            <div className="p-4 border-2 border-orange-500 rounded-lg bg-orange-50">
                <h2 className="font-bold text-xl text-orange-800">🚌 Buses (Route 110)</h2>
                <p className="text-sm text-gray-600 mb-2">Last Updated: {lastUpdated}</p>
                
                <div className="mt-2 text-sm font-mono bg-white p-2 rounded max-h-60 overflow-auto">
                    {buses.length === 0 ? (
                        <p className="text-gray-500">No buses found...</p>
                    ) : (
                        <pre>{JSON.stringify(buses, null, 2)}</pre>
                    )}
                </div>
            </div>

        </div>
    );
}



