// components/Card.tsx 
import Badge from "./Badge";

// Receives `title` (name), `subtitle` (address/info), `status`, and `onClick` (click event) from the parent component.
export default function Card({ title, subtitle, status, onClick }: any) {
  return (
    <div 
      onClick={onClick}   // Clicking the card executes the route-finding or map navigation function.
      // Tailwind CSS: Designing the Entire Card
      className="w-full py-6 pl-11 pr-6 bg-white border-b border-slate-100 hover:bg-[#FFFDF5] transition-all cursor-pointer group flex justify-between items-center box-border"
    >
      {/* Left Area: Name and Address */}
      <div className="flex-1 text-left">
        {/* Title: Parking Lot Name */}
        <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors text-lg tracking-tight">
          {title}
        </h3>
        {/* Subtitle: Location Information (Displayed with icons) */}
        <p className="text-sm text-slate-400 mt-1.5 flex items-center gap-2 font-medium">
          <span className="text-[16px]">📍</span> 
          <span className="truncate">{subtitle}</span> {/* If the address is too long, it is truncated. */}
        </p>
      </div>
      
      {/* Right Area: Import the Badge component to display the status. */}
      <div className="flex-shrink-0">
        <Badge status={status} />
      </div>
    </div>
  );
}