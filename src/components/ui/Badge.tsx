import { cn } from '@/lib/utils/format';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'orange';
  className?: string;
}

const variants = {
  gray: 'bg-gray-50 text-gray-700 ring-gray-500/15',
  green: 'bg-brand-50 text-brand-800 ring-brand-600/20',
  yellow: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/15',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/15',
  purple: 'bg-purple-50 text-purple-700 ring-purple-600/15',
  orange: 'bg-orange-50 text-orange-700 ring-orange-600/15',
};

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
