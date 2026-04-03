// components/Badge.tsx
export default function Badge({ status }: { status: string }) {
  // // 1. A function that determines the background color, text color, and border color based on the status.
  const getBadgeStyle = (s: string) => {
    switch (s) {
      case "Full":  // When full: Light red background
        return { backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }; // light red
      case "Open":  // When at ease: Light green background
        return { backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }; // light green
      case "Limited":  // When little time remains: Light orange background
        return { backgroundColor: '#ffedd5', color: '#ea580c', border: '1px solid #fed7aa' }; // Orange
      default:  // Other Default State: Gray Background
        return { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }; // light green
    }
  };

  // Store the style object determined by the above function in a variable.
  const style = getBadgeStyle(status);

  return (
    <span 
      style={style}  // Apply Selected Color Style
      // Tailwind CSS: Layout Processing (Rounded Corners, Font Sizes, Spacing, Shadows, etc.)
      className="inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight shadow-sm min-w-[55px] text-center"
    >
      {status}    {/* Display text such as "Full" or "Open" on the screen. */}
    </span>
  );
}