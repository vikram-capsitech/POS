import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-[#1e293b] flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-[#94a3b8]" />
      </div>
      <h3 className="text-white text-xl font-semibold mb-2">{title}</h3>
      {description && <p className="text-[#94a3b8] text-center mb-6 max-w-md">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:from-[#c2410c] hover:to-[#ea580c] text-white rounded-xl font-semibold transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
