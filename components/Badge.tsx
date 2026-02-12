// components/Badge.tsx
export default function Badge({ status }: { status: string }) {
  const styles: { [key: string]: string } = {
    "Full": "bg-red-500 text-white",
    "Open": "bg-green-500 text-white",
    "Limited": "bg-orange-500 text-white",
    "Delayed": "bg-yellow-500 text-black", // MARTA
  };

  return (
    <span className={`${styles[status] || "bg-gray-400"} px-2 py-1 rounded text-xs font-bold uppercase`}>
      {status}
    </span>
  );
}
