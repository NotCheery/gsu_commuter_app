// app/page.tsx
import Badge from '../components/Badge';
import Card from '../components/Card'; 

export default function Dashboard() {
  // Parking lot data is fake data(Placeholder)
  const parkingDecks = [
    { name: "T Deck", status: "Full", location: "43 Gilmer St SE" },
    { name: "M Deck", status: "Open", location: "33 Auburn Ave" },
    { name: "G Deck", status: "Limited", location: "121 Collins St" },
    { name: "S Deck", status: "Limited", location: "Near Petite Science Center" }, 
    { name: "CC Deck", status: "Open", location: "Campus Center" }
  ];

  return (
    <main className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      
      {/* 1. Left sidebar: List of parking lots */}
      <section className="w-80 bg-white border-r shadow-sm flex flex-col z-30">
        <div className="p-6 border-b">
          <h1 className="text-xl font-black text-blue-700 uppercase tracking-tighter">GSU Commuter</h1>
          <p className="text-xs text-gray-400">Team 12 Capstone Project </p>
        </div>

        <div className="overflow-y-auto flex-1">
          <h2 className="text-sm font-bold text-gray-600 my-4 px-6 uppercase tracking-widest">
            Parking Availability
          </h2>
          
          <div className="flex flex-col">
            {/* Iterate over the parkingDecks data and render the Card component.  */}
            {parkingDecks.map((deck) => (
              <Card 
                key={deck.name} 
                title={deck.name} 
                subtitle={deck.location} 
                status={deck.status} 
              />
            ))}
          </div>
        </div>

        {/* Bottom button: Directions (Future Enhancement planned) */}
        <div className="p-4 border-t bg-slate-50">
          <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
            Get Directions
          </button>
        </div>
      </section>

      {/* 2. Right main space: Map (to be collaborated with Mirtha) */}
      <section className="flex-1 bg-slate-200 relative flex flex-col">
        {/* Central map placeholder */}
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="text-5xl mb-3 animate-bounce">📍</div>
            <p className="text-slate-500 font-bold text-xl uppercase tracking-tight">Map Visualization Area </p>
            <p className="text-slate-400 text-sm italic">Integrating with Google/Mapbox API soon </p>
          </div>
        </div>
        
        {/* Top navigation bar (Navbar: MARTA vs CAR selection) */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white z-20">
          <div className="flex gap-3">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition">
              CAR 
            </button>
            <button className="px-6 py-2 bg-white text-slate-500 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-50 transition">
              MARTA 
            </button>
          </div>
          {/* User notification window icon (Future feature) */}
          <div className="flex items-center gap-4 ml-4 min-w-fit">
             <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full animate-pulse whitespace-nowrap border border-red-100">
               3 Live Alerts 
             </span>
             <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-blue-300 rounded-full border-2 border-white shadow-sm flex-shrink-0"></div>
          </div>
        </div>
      </section>

    </main>
  );
}
