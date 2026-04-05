# Services Documentation

This folder contains service modules that handle external API integrations and business logic.

## martaApi.ts

### Purpose
Provides functions to fetch real-time MARTA (train and bus) data from official MARTA APIs.

### Interfaces

#### MartaTrain
Real-time train arrival data
```typescript
interface MartaTrain {
  DESTINATION: string;      // e.g., "Airport"
  DIRECTION: string;         // e.g., "Southbound"
  EVENT_TIME: string;        // Timestamp
  LINE: string;              // e.g., "Red Line"
  NEXT_ARR: string;          // Next arrival time
  STATION: string;           // Station name
  TRAIN_ID: string;          // Unique train identifier
  WAITING_SECONDS: string;   // Seconds until arrival
  WAITING_TIME: string;      // Human-readable wait time (e.g., "3 min")
}
```

#### MartaBus
Real-time bus vehicle position data
```typescript
interface MartaBus {
  ADHERENCE: string;         // On-time adherence
  BLOCKID: string;           // Block identifier
  BLOCK_ABBR: string;        // Block abbreviation
  DIRECTION: string;         // Direction of travel
  LATITUDE: string;          // Current latitude
  LONGITUDE: string;         // Current longitude
  MSGTIME: string;           // Last update time
  ROUTE: string;             // Route number
  STOPID: string;            // Stop identifier
  TIMEPOINT: string;         // Timepoint indicator
  TRIPID: string;            // Trip identifier
  VEHICLE: string;           // Vehicle ID
}
```

### Functions

#### getRealtimeTrainData(stationName: string)
Fetches real-time arrival data for trains at a specific station.

**Parameters:**
- `stationName` (string) - Name of the station (case-insensitive, partial match supported)

**Returns:**
- `Promise<MartaTrain[]>` - Array of arriving trains

**Example:**
```typescript
import { getRealtimeTrainData } from '@/services/martaApi';

const trains = await getRealtimeTrainData('Five Points');
trains.forEach(train => {
  console.log(`${train.DESTINATION} - ${train.WAITING_TIME}`);
});
```

#### getRealtimeBusData(routeNumber: string)
Fetches real-time vehicle position data for buses on a specific route.

**Parameters:**
- `routeNumber` (string) - Route number to filter (e.g., "40", "816")

**Returns:**
- `Promise<MartaBus[]>` - Array of vehicles on the route

**Example:**
```typescript
import { getRealtimeBusData } from '@/services/martaApi';

const buses = await getRealtimeBusData('40');
buses.forEach(bus => {
  console.log(`Bus ${bus.VEHICLE} at ${bus.LATITUDE}, ${bus.LONGITUDE}`);
});
```

## gsuScraper.ts

Placeholder for future GSU-specific data scraping (e.g., parking availability, campus events).

## Contributing

When adding new services:
1. Create a new file with clear naming (e.g., `partnershipApi.ts`)
2. Define TypeScript interfaces for data structures
3. Document functions with JSDoc comments
4. Include error handling and logging
5. Add usage examples in this README

## Error Handling

All services should handle errors gracefully:
- Network timeouts
- API rate limits
- Invalid responses
- Missing authentication

Example:
```typescript
try {
  const data = await getRealtimeTrainData('Georgia State');
  return data;
} catch (error) {
  console.error("Failed to fetch train data:", error);
  return []; // Return empty array as fallback
}
```

## API Rate Limits

- MARTA Rail API: Generally unlimited for development key
- MARTA Bus API (GTFS-RT): No strict rate limits observed

Monitor API response times and implement caching if needed.

## Testing Services

```typescript
// Test in a Node.js script or browser console
import { getRealtimeTrainData, getRealtimeBusData } from '@/services/martaApi';

// Test trains
const trainData = await getRealtimeTrainData('Five Points');
console.log(trainData);

// Test buses
const busData = await getRealtimeBusData('40');
console.log(busData);
```
