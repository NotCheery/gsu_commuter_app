// components/Card.tsx 
import Badge from "./Badge";

export default function Card({ title, subtitle, status, onClick }: any) {
  return (
    <div 
      onClick={onClick} 
      // pl-11 정도로 조정하면 Alert의 5px 선과 글자 시작 위치가 딱 맞습니다.
      className="w-full py-6 pl-11 pr-6 bg-white border-b border-slate-100 hover:bg-slate-50 transition-all cursor-pointer group flex justify-between items-center box-border"
    >
      <div className="flex-1 text-left">
        <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors text-lg tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-slate-400 mt-1.5 flex items-center gap-2 font-medium">
          <span className="text-[16px]">📍</span> 
          <span className="truncate">{subtitle}</span>
        </p>
      </div>
      
      <div className="flex-shrink-0">
        <Badge status={status} />
      </div>
    </div>
  );
}