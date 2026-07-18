import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatRelative } from '@/lib/utils/date';
import type { ActivityItem } from '@/services/dashboard';

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      {activities.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No recent activity yet.</p>
      ) : (
        <ul className="space-y-4">
          {activities.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-brand-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{item.action}</p>
                <p className="text-sm text-gray-500 truncate">{item.detail}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{formatRelative(item.time)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
