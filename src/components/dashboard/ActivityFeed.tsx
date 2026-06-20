import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatRelative } from '@/lib/utils/date';

const activities = [
  { id: 1, action: 'Rent payment received', detail: 'Unit 4B — KES 45,000', time: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, action: 'New tenant added', detail: 'Jane Wanjiku — Unit 12A', time: new Date(Date.now() - 7200000).toISOString() },
  { id: 3, action: 'Maintenance resolved', detail: 'Plumbing — Unit 7C', time: new Date(Date.now() - 86400000).toISOString() },
  { id: 4, action: 'Invoice generated', detail: 'June rent — 24 units', time: new Date(Date.now() - 172800000).toISOString() },
];

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <ul className="space-y-4">
        {activities.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{item.action}</p>
              <p className="text-sm text-gray-500 truncate">{item.detail}</p>
            </div>
            <span className="text-xs text-gray-400 shrink-0">{formatRelative(item.time)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
