'use client';

import { Wrench } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
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
        <div className="space-y-3 p-6">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </Card>
    );
  }

  if (!requests.length) {
    return (
      <Card padding="none">
        <EmptyState
          icon={Wrench}
          title="No maintenance requests"
          description="Requests reported by tenants or staff will show up here."
        />
      </Card>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <Table>
        <THead>
          <TH>Title</TH>
          <TH>Unit</TH>
          <TH>Priority</TH>
          <TH>Status</TH>
          <TH>Reported</TH>
          {onStatusChange && <TH>Actions</TH>}
        </THead>
        <TBody>
          {requests.map((req) => {
            const priority = MAINTENANCE_PRIORITIES[req.priority];
            const isClosed = req.status === 'resolved' || req.status === 'cancelled';
            return (
              <TR key={req.id}>
                <TD>
                  <div className="font-medium text-gray-900">{req.title}</div>
                  <div className="max-w-xs truncate text-xs text-gray-400">{req.description}</div>
                </TD>
                <TD>{req.units?.unit_number} · {req.units?.buildings?.name || ''}</TD>
                <TD>
                  <Badge variant={priority.color as 'gray' | 'blue' | 'orange' | 'red'}>{priority.label}</Badge>
                </TD>
                <TD><MaintenanceStatusBadge status={req.status} /></TD>
                <TD>
                  <span title={formatDate(req.created_at)}>{formatRelative(req.created_at)}</span>
                </TD>
                {onStatusChange && (
                  <TD>
                    {isClosed ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <select
                        className="rounded-lg border border-gray-300 px-2 py-1 text-xs shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                        value={req.status}
                        onChange={(e) => onStatusChange(req.id, e.target.value as MaintenanceWithRelations['status'])}
                      >
                        {Object.entries(MAINTENANCE_STATUSES).map(([value, { label }]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    )}
                  </TD>
                )}
              </TR>
            );
          })}
        </TBody>
      </Table>
    </Card>
  );
}
