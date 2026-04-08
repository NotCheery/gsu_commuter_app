// components/TrainArrivalDetails.tsx
export interface TrainArrival {
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

interface TrainArrivalDetailsProps {
  stationName: string;
  arrivals: TrainArrival[];
  onBack: () => void;
  isLoading?: boolean;
}

export default function TrainArrivalDetails({
  stationName,
  arrivals,
  onBack,
  isLoading = false,
}: TrainArrivalDetailsProps) {
  // Map direction codes to full names
  const getDirectionName = (code: string): string => {
    const directionMap: Record<string, string> = {
      "N": "Northbound",
      "S": "Southbound",
      "E": "Eastbound",
      "W": "Westbound",
      "NE": "Northeast",
      "NW": "Northwest",
      "SE": "Southeast",
      "SW": "Southwest",
    };
    return directionMap[code?.toUpperCase()] || code || "Unknown";
  };

  // Get line colors with inline styles for better support
  const getLineStyle = (line: string) => {
    const lineColorMap: Record<string, { bg: string; textColor: string; borderColor: string }> = {
      "RED": { bg: "#fee2e2", textColor: "#991b1b", borderColor: "#fca5a5" },
      "GOLD": { bg: "#fef3c7", textColor: "#b45309", borderColor: "#fde68a" },
      "GREEN": { bg: "#dcfce7", textColor: "#15803d", borderColor: "#86efac" },
      "BLUE": { bg: "#dbeafe", textColor: "#1e40af", borderColor: "#93c5fd" },
      "SILVER": { bg: "#f1f5f9", textColor: "#334155", borderColor: "#cbd5e1" },
    };
    return lineColorMap[line?.toUpperCase()] || { bg: "#f1f5f9", textColor: "#334155", borderColor: "#cbd5e1" };
  };

  // Function to parse waiting time and convert to seconds for comparison
  const parseWaitingTime = (waitingTime: string): number => {
    const match = waitingTime?.match(/\d+/);
    return match ? parseInt(match[0], 10) : 999;
  };

  // Group arrivals by direction and destination, keeping only the earliest
  const groupedByDirectionAndDest = arrivals.reduce((acc, arrival) => {
    const direction = getDirectionName(arrival.DIRECTION);
    const destination = arrival.DESTINATION;
    
    if (!acc[direction]) {
      acc[direction] = {};
    }

    if (!acc[direction][destination]) {
      acc[direction][destination] = arrival;
    } else {
      // Keep only the earliest arrival
      const currentWaitTime = parseWaitingTime(acc[direction][destination].WAITING_TIME);
      const newWaitTime = parseWaitingTime(arrival.WAITING_TIME);
      if (newWaitTime < currentWaitTime) {
        acc[direction][destination] = arrival;
      }
    }
    return acc;
  }, {} as Record<string, Record<string, TrainArrival>>);

  return (
    <div className="py-4">
      {/* Back Button Header */}
      <div className="flex items-center gap-3 px-6 pb-4 mb-2 border-b border-slate-200">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 transition-colors font-bold text-lg"
          title="Back to stations"
        >
          ← Back
        </button>
        <h2 className="text-sm font-bold text-slate-700 flex-1 truncate">{stationName}</h2>
      </div>

      {/* Arrivals Content */}
      {isLoading ? (
        <div className="p-6 text-center text-slate-500 text-sm">Loading train arrivals...</div>
      ) : arrivals.length === 0 ? (
        <div className="p-6 text-center text-slate-500 text-sm">No arrivals available</div>
      ) : (
        <div className="overflow-y-auto">
          {Object.entries(groupedByDirectionAndDest).map(([direction, destinations], sectionIdx) => (
            <div key={direction} className={`${sectionIdx > 0 ? "mt-6 pt-6 border-t-2 border-slate-300" : ""}`}>
              {/* Direction Header - Bold and Highlighted */}
              <div className="bg-blue-600 text-white px-6 py-4 font-bold text-lg uppercase tracking-wider text-center mb-4 rounded-lg shadow-md">
                {direction}
              </div>

              {/* Trains in this direction */}
              <div className="space-y-4 px-6">
                {Object.entries(destinations).map(([destination, train], index) => {
                  const lineStyle = getLineStyle(train.LINE);
                  // Format line name nicely (e.g., "RED" -> "Red")
                  const formattedLine = train.LINE
                    .toLowerCase()
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                  
                  return (
                    <div key={`${direction}-${destination}-${index}`} className="pb-4 border-b border-slate-200 last:border-b-0">
                      {/* Train Destination and Arrival Time in one line */}
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-slate-900 text-base">{destination}</p>
                        <span className="font-bold text-blue-600 text-base">{train.WAITING_TIME}</span>
                      </div>

                      {/* Line Badge with inline styles */}
                      <div className="mt-2">
                        <span 
                          style={{
                            backgroundColor: lineStyle.bg,
                            color: lineStyle.textColor,
                            borderColor: lineStyle.borderColor,
                          }}
                          className="inline-block px-3 py-1 rounded text-sm font-bold border-2"
                        >
                          {formattedLine}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
