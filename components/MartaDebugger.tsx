"use client"; //tells Next.js to run in browser, not server

import { useEffect, useState } from "react";
import axios from 'axios';

interface Train {
    STATION : string;
    NEXT_ARR: string;
    DESTINATION: string;
}

export default function MartaDebugger() {
    const [trains, setTrains] = useState<Train[]>([]);
    const [lastUpdated, setLastUpdated] = useState<string>("Never");

    const fetchData = async () => {
        try {
            console.log("🚄 Fetching fresh MARTA data...");
            const response = await axios.get('/api/marta?station=Georgia+State');

            setTrains(response.data)
            setLastUpdated(new Date().toLocaleTimeString());

            console.log("✅ Data received:", response.data);

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
    <div className="p-4 border-2 border-blue-500 m-4 rounded-lg bg-blue-50">
      <h2 className="font-bold text-xl text-blue-800">MARTA Data Debugger</h2>
      <p>Last Updated: <span className="font-mono">{lastUpdated}</span></p>
      <div className="mt-2 text-sm font-mono bg-white p-2 rounded max-h-40 overflow-auto">
        {trains.length === 0 ? (
          <p>No trains found or loading...</p>
        ) : (
          <pre>{JSON.stringify(trains, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};



