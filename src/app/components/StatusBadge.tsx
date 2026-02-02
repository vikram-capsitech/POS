interface StatusBadgeProps {
  status: 'available' | 'occupied' | 'reserved' | 'billing' | 'pending' | 'preparing' | 'ready' | 'served' | 'paid';
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'available':
        return 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]';
      case 'occupied':
        return 'bg-[#06b6d4]/20 text-[#06b6d4] border-[#06b6d4]';
      case 'reserved':
        return 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]';
      case 'billing':
        return 'bg-[#f97316]/20 text-[#f97316] border-[#f97316]';
      case 'pending':
        return 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]';
      case 'preparing':
        return 'bg-[#06b6d4]/20 text-[#06b6d4] border-[#06b6d4]';
      case 'ready':
        return 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]';
      case 'served':
        return 'bg-[#64748b]/20 text-[#64748b] border-[#64748b]';
      case 'paid':
        return 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]';
      default:
        return 'bg-[#64748b]/20 text-[#64748b] border-[#64748b]';
    }
  };

  const getStatusLabel = () => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusStyles()} ${className}`}>
      {getStatusLabel()}
    </span>
  );
}
