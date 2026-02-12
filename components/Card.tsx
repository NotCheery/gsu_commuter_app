import Badge from "./Badge";

export default function Card({ title, subtitle, status }: any) {
  return (
    <div className="p-4 border-b hover:bg-gray-50 cursor-pointer transition">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-blue-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <Badge status={status} />
      </div>
    </div>
  );
}
