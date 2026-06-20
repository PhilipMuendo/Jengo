import { Card } from '@/components/ui/Card';
import { formatKES } from '@/lib/utils/currency';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Stat {
  label: string;
  value: number | string;
  change: string;
  isCurrency?: boolean;
}

export function StatsGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const isPositive = stat.change.startsWith('+');
        return (
          <Card key={stat.label}>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {stat.isCurrency ? formatKES(Number(stat.value)) : stat.value}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs">
              {isPositive ? (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={isPositive ? 'text-emerald-600' : 'text-red-600'}>{stat.change}</span>
              <span className="text-gray-400">vs last month</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
