import { Card } from '@/components/ui/Card';
import { formatKES } from '@/lib/utils/currency';
import { cn } from '@/lib/utils/format';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Stat {
  label: string;
  value: number | string;
  /** Month-over-month change, e.g. "+12%". Omit when no trend data is available. */
  change?: string;
  isCurrency?: boolean;
}

export function StatsGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const isPositive = stat.change?.startsWith('+') ?? false;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        return (
          <Card key={stat.label} interactive>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900 tabular-nums">
              {stat.isCurrency ? formatKES(Number(stat.value)) : stat.value}
            </p>
            {stat.change && (
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
                    isPositive ? 'bg-brand-50 text-brand-700' : 'bg-red-50 text-red-700'
                  )}
                >
                  <TrendIcon className="h-3 w-3" />
                  {stat.change}
                </span>
                <span className="text-gray-400">vs last month</span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
