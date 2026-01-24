import { NextResponse } from "next/server";
import { getRealtimeTrainData } from "@/services/martaApi";

export async function GET(request: Request) {
    // get station name from the URL (eg. ?station=Georgia State)
    const { searchParams } = new URL(request.url);
    const station = searchParams.get('station');

    // validate input 
    if (!station) {
        return NextResponse.json({ error: "Station parameter is required" }, { status: 400 });
    }

    // fetch data
    const data = await getRealtimeTrainData(station);

    // return data as JSON
    return NextResponse.json(data);
}

// this should work
// run npm run dev and then go to this website
// http://localhost:3000/api/marta?station=Georgia+State