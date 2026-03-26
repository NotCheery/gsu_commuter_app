import { NextResponse } from "next/server";
import { getRealtimeTrainData, getRealtimeBusData } from "@/services/martaApi";
import { stat } from "fs";

export async function GET(request: Request) {
    // get station name from the URL (eg. ?station=Georgia State)
    const { searchParams } = new URL(request.url);
    const station = searchParams.get('station');
    const route = searchParams.get('route');

        // Train Request
    try {
        if (station) {
            const data = await getRealtimeTrainData(station);
            return NextResponse.json(data);
        }
        // bus request
        if (route) {
            const data = await getRealtimeBusData(route);
            return NextResponse.json(data);
        }
        // if neither station nor route is provided, return error
        return NextResponse.json({ error: "No parameters provided" }, { status: 400 });
    } catch (err) {
        return NextResponse.json({ error: "MARTA API Failure" }, { status: 500 });
    }
}
// this should work
// run npm run dev and then go to this website
// http://localhost:3000/api/marta?station=Georgia+State
// http://localhost:3000/api/marta?route=816