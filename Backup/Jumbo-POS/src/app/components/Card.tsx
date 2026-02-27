import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'bordered';
  hover?: boolean;
}

export function Card({ children, className = '', variant = 'default', hover = false }: CardProps) {
  const baseStyles = 'rounded-2xl p-6';

  const variantStyles = {
    default: 'bg-[#1e293b] border border-[#334155]',
    gradient: 'bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-[#334155]',
    bordered: 'bg-[#0f172a] border-2 border-[#334155]',
  };

  const hoverStyles = hover ? 'transition-all hover:border-[#ea580c] hover:shadow-lg hover:shadow-[#ea580c]/20' : '';

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}
