# MARTA Integration Architecture

## Overview
This document outlines the structure and integration of real-time MARTA (Metropolitan Atlanta Rapid Transit Authority) data into the GSU Commuter app.

## File Organization

### Services Layer (`/services`)
- **martaApi.ts** - Direct integration with MARTA APIs
  - `getRealtimeTrainData(stationName)` - Fetches real-time train arrivals from MARTA Rail API
  - `getRealtimeBusData(routeNumber)` - Fetches real-time bus vehicle positions from MARTA Bus API
  - Uses GTFS-Realtime format for bus data

### API Routes (`/app/api/marta`)

#### `/nearby-trains` - GET
Fetches nearby train stations based on user location with real-time arrival data.

**Query Parameters:**
- `lat` (number, required) - User latitude
- `lng` (number, required) - User longitude
- `radius` (number, optional, default: 1.5) - Search radius in miles

**Response:**
```json
[
  {
    "name": "Five Points",
    "coords": "-84.3915,33.7525",
    "line": "Red, Gold, Blue",
    "distance": 0.45,
    "arrivals": [
      {
        "DESTINATION": "Airport",
        "DIRECTION": "Southbound",
        "WAITING_TIME": "3 min",
        "WAITING_SECONDS": "180",
        ...
      }
    ]
  }
]
```

#### `/nearby-buses` - GET
Fetches nearby bus stops based on user location with real-time bus vehicle data.

**Query Parameters:**
- `lat` (number, required) - User latitude
- `lng` (number, required) - User longitude
- `radius` (number, optional, default: 1) - Search radius in miles

**Response:**
```json
[
  {
    "name": "Courtland St & Gilmer St",
    "coords": "-84.3855,33.7558",
    "routes": ["40", "816"],
    "distance": 0.25,
    "buses": [
      {
        "route": "40",
        "vehicles": [
          {
            "LATITUDE": "33.7558",
            "LONGITUDE": "-84.3855",
            "VEHICLE_ID": "3040",
            ...
          }
        ]
      }
    ]
  }
]
```

### Utilities (`/lib`)

#### `geoUtils.ts`
- `calculateDistance(from, to)` - Haversine formula for distance calculation
- `findNearbyStations(stations, userLocation, radiusMiles)` - Filters stations within radius

#### `hooks/useMartaData.ts`
Custom React hooks for data fetching:
- `useNearbyTrains(userLocation)` - Fetches and caches nearby train stations
  - Auto-refreshes every 30 seconds
  - Returns: `{ trains, loading, error }`
- `useNearbyBuses(userLocation)` - Fetches and caches nearby bus stops
  - Auto-refreshes every 30 seconds
  - Returns: `{ buses, loading, error }`

### Frontend Component Updates

**app/page.tsx** (Main Dashboard)
- Integrated `useNearbyTrains` and `useNearbyBuses` hooks
- Displays real-time data instead of static placeholders
- Shows distance to each station/stop
- Updates every 30 seconds for fresh data

## Data Flow

```
User Location (Geolocation API)
    ↓
useNearbyTrains / useNearbyBuses hooks
    ↓
API Routes (/api/marta/nearby-trains, /api/marta/nearby-buses)
    ↓
Service Layer (martaApi.ts)
    ↓
MARTA Public APIs (Rail & Bus)
    ↓
Frontend Components (Cards with real-time data)
```

## MARTA Data Sources

### Train Data
- **API**: MARTA Rail Real-time Arrivals
- **URL**: https://developerservices.itsmarta.com:18096/itsmarta/railrealtimearrivals/...
- **Format**: JSON
- **Update Frequency**: Real-time
- **API Key**: Required (stored in .env)

### Bus Data
- **API**: MARTA GTFS-Realtime Bus Positions
- **URL**: https://gtfs-rt.itsmarta.com/TMGTFSRealTimeWebService/vehicle/vehiclepositions.pb
- **Format**: Protocol Buffers (GTFS-Realtime)
- **Update Frequency**: Real-time
- **Authentication**: User-Agent header

## Environment Variables

Add to your `.env.local`:
```
MARTA_API_KEY='marta_api_key'

```

## Future Enhancements

1. **Caching** - Add Redis caching for frequently requested stations
2. **Prediction** - ML-based arrival time predictions
3. **Alerts** - Push notifications for delays
4. **Route Planning** - Multi-modal journey planning with MARTA
5. **Accessibility** - A11y improvements for transit info
6. **Historical Data** - Track punctuality and patterns

## Troubleshooting

### "No nearby stations found"
- Check user location permissions
- Verify MARTA API keys in .env
- Check network connectivity

### Stale Data
- Hooks auto-refresh every 30 seconds
- Force refresh by toggling commute mode

### API Errors
- MARTA APIs may have rate limits
- Check console for specific error messages
- Verify User-Agent headers for bus API

## Testing

```bash
# Test nearby trains
curl "http://localhost:3000/api/marta/nearby-trains?lat=33.7537&lng=-84.3863"

# Test nearby buses
curl "http://localhost:3000/api/marta/nearby-buses?lat=33.7537&lng=-84.3863"
```
