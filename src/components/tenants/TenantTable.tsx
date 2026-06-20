'use client';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { LEASE_STATUSES } from '@/lib/constants/statuses';
import { formatDate } from '@/lib/utils/date';
import type { TenantWithLease } from '@/services/tenants';

interface TenantTableProps {
  tenants: TenantWithLease[];
  loading?: boolean;
}

export function TenantTable({ tenants, loading }: TenantTableProps) {
  if (loading) {
    return (
      <Card padding="none">
        <div className="p-6 space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </Card>
    );
  }

  if (!tenants.length) {
    return <Card><p className="text-gray-500 text-center py-8">No tenants registered yet.</p></Card>;
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Contact</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Unit</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Lease</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tenants.map((tenant) => {
              const lease = tenant.leases?.[0];
              const unit = lease?.units;
              const leaseStatus = lease?.status || 'pending';
              const statusConfig = LEASE_STATUSES[leaseStatus];
              return (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{tenant.full_name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <div>{tenant.email}</div>
                    <div className="text-xs text-gray-400">{tenant.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {unit ? `${unit.unit_number} · ${unit.buildings?.name || ''}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {lease ? `${formatDate(lease.start_date)} – ${formatDate(lease.end_date)}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusConfig.color as 'green' | 'gray' | 'red' | 'yellow'}>{statusConfig.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
