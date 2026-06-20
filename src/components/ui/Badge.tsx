import { cn } from '@/lib/utils/format';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'orange';
  className?: string;
}

const variants = {
  gray: 'bg-gray-100 text-gray-700',
  green: 'bg-emerald-100 text-emerald-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
  orange: 'bg-orange-100 text-orange-800',
};

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}
