'use client';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { MaintenanceStatusBadge } from './MaintenanceStatusBadge';
import { MAINTENANCE_PRIORITIES, MAINTENANCE_STATUSES } from '@/lib/constants/statuses';
import { formatDate, formatRelative } from '@/lib/utils/date';
import type { MaintenanceWithRelations } from '@/services/maintenance';

interface MaintenanceTableProps {
  requests: MaintenanceWithRelations[];
  loading?: boolean;
  onStatusChange?: (id: string, status: MaintenanceWithRelations['status']) => void;
}

export function MaintenanceTable({ requests, loading, onStatusChange }: MaintenanceTableProps) {
  if (loading) {
    return (
      <Card padding="none">
        <div className="p-6 space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </Card>
    );
  }

  if (!requests.length) {
    return <Card><p className="text-gray-500 text-center py-8">No maintenance requests.</p></Card>;
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Title</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Unit</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Priority</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Reported</th>
              {onStatusChange && <th className="text-left px-6 py-3 font-medium text-gray-500">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {requests.map((req) => {
              const priority = MAINTENANCE_PRIORITIES[req.priority];
              return (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{req.title}</div>
                    <div className="text-xs text-gray-400 truncate max-w-xs">{req.description}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {req.units?.unit_number} · {req.units?.buildings?.name || ''}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={priority.color as 'gray' | 'blue' | 'orange' | 'red'}>{priority.label}</Badge>
                  </td>
                  <td className="px-6 py-4"><MaintenanceStatusBadge status={req.status} /></td>
                  <td className="px-6 py-4 text-gray-600" title={formatDate(req.created_at)}>
                    {formatRelative(req.created_at)}
                  </td>
                  {onStatusChange && req.status !== 'resolved' && req.status !== 'cancelled' && (
                    <td className="px-6 py-4">
                      <select
                        className="text-xs rounded border border-gray-300 px-2 py-1"
                        value={req.status}
                        onChange={(e) => onStatusChange(req.id, e.target.value as MaintenanceWithRelations['status'])}
                      >
                        {Object.entries(MAINTENANCE_STATUSES).map(([value, { label }]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </td>
                  )}
                  {onStatusChange && (req.status === 'resolved' || req.status === 'cancelled') && (
                    <td className="px-6 py-4 text-gray-400">—</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
