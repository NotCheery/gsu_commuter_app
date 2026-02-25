// components/Badge.tsx
export default function Badge({ status }: { status: string }) {
  const getBadgeStyle = (s: string) => {
    switch (s) {
      case "Full": 
        return { backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }; // light red
      case "Open": 
        return { backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }; // light green
      case "Limited": 
        return { backgroundColor: '#ffedd5', color: '#ea580c', border: '1px solid #fed7aa' }; // Orange
      default: 
        return { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }; // light green
    }
  };

  const style = getBadgeStyle(status);

  return (
    <span 
      style={style}
      className="inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight shadow-sm min-w-[55px] text-center"
    >
      {status}
    </span>
  );
}