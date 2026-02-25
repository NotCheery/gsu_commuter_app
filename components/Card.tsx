// components/Card.tsx 
import Badge from "./Badge";

export default function Card({ title, subtitle, status, onClick }: any) {
  return (
    <div 
      onClick={onClick} 
      className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group mb-4 flex justify-between items-center"
    >
      <div className="flex-1">
        <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors text-lg">
          {title}
        </h3>
        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
          <span className="text-xs">📍</span> {subtitle}
        </p>
      </div>
      
      {/* So that the badge is nicely placed in the center right of the card. */}
      <div className="ml-4">
        <Badge status={status} />
      </div>
    </div>
  );
}