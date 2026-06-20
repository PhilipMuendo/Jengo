import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, Clock, Wrench } from 'lucide-react';

const items = [
  { id: 1, type: 'arrears', title: '3 tenants in arrears', detail: 'Total: KES 135,000', href: '/arrears', icon: AlertTriangle, variant: 'red' as const },
  { id: 2, type: 'leases', title: '2 leases expiring soon', detail: 'Within 30 days', href: '/tenants', icon: Clock, variant: 'yellow' as const },
  { id: 3, type: 'maintenance', title: '5 open maintenance requests', detail: '2 urgent', href: '/maintenance', icon: Wrench, variant: 'orange' as const },
];

export function AttentionItems() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Needs Attention</CardTitle>
      </CardHeader>
      <ul className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
              >
                <div className={`rounded-lg p-2 bg-${item.variant}-50`}>
                  <Icon className={`h-4 w-4 text-${item.variant}-600`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.detail}</p>
                </div>
                <Badge variant={item.variant}>View</Badge>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
