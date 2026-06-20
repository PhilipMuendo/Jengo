'use client';

import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MaintenanceStatusBadge } from '@/components/maintenance/MaintenanceStatusBadge';
import { formatRelative } from '@/lib/utils/date';
import type { MaintenanceRequest } from '@/types/database.types';

interface TenantMaintenanceProps {
  requests: MaintenanceRequest[];
}

export function TenantMaintenance({ requests }: TenantMaintenanceProps) {
  const active = requests.filter((r) => !['resolved', 'cancelled'].includes(r.status));

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <CardTitle>Maintenance Requests</CardTitle>
        <Link href="/maintenance/new">
          <Button size="sm" variant="outline">New Request</Button>
        </Link>
      </div>
      {active.length ? (
        <ul className="space-y-3">
          {active.map((req) => (
            <li key={req.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
              <div>
                <p className="font-medium text-gray-900">{req.title}</p>
                <p className="text-xs text-gray-400">{formatRelative(req.created_at)}</p>
              </div>
              <MaintenanceStatusBadge status={req.status} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No open maintenance requests</p>
      )}
    </Card>
  );
}
