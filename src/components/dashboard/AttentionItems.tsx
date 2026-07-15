import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, Clock, Wrench, CheckCircle2 } from 'lucide-react';
import { formatKES } from '@/lib/utils/currency';
import type { AttentionSummary } from '@/services/dashboard';

type Variant = 'red' | 'yellow' | 'orange';

const iconStyles: Record<Variant, string> = {
  red: 'bg-red-50 text-red-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  orange: 'bg-orange-50 text-orange-600',
};

export function AttentionItems({ summary }: { summary: AttentionSummary }) {
  const items = [
    summary.arrears.count > 0 && {
      id: 'arrears',
      title: `${summary.arrears.count} ${summary.arrears.count === 1 ? 'tenant' : 'tenants'} in arrears`,
      detail: `Total: ${formatKES(summary.arrears.total)}`,
      href: '/arrears',
      icon: AlertTriangle,
      variant: 'red' as Variant,
    },
    summary.expiringLeases.count > 0 && {
      id: 'leases',
      title: `${summary.expiringLeases.count} ${summary.expiringLeases.count === 1 ? 'lease' : 'leases'} expiring soon`,
      detail: 'Within 30 days',
      href: '/tenants',
      icon: Clock,
      variant: 'yellow' as Variant,
    },
    summary.maintenance.open > 0 && {
      id: 'maintenance',
      title: `${summary.maintenance.open} open maintenance ${summary.maintenance.open === 1 ? 'request' : 'requests'}`,
      detail: summary.maintenance.urgent > 0 ? `${summary.maintenance.urgent} urgent` : 'None urgent',
      href: '/maintenance',
      icon: Wrench,
      variant: 'orange' as Variant,
    },
  ].filter(Boolean) as {
    id: string;
    title: string;
    detail: string;
    href: string;
    icon: typeof AlertTriangle;
    variant: Variant;
  }[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Needs Attention</CardTitle>
      </CardHeader>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          <p className="text-sm text-gray-500">All caught up — nothing needs attention.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                >
                  <div className={`rounded-lg p-2 ${iconStyles[item.variant]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.detail}</p>
                  </div>
                  <Badge variant={item.variant}>View</Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
