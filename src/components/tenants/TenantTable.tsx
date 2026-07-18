'use client';

import { Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
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
        <div className="space-y-3 p-6">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </Card>
    );
  }

  if (!tenants.length) {
    return (
      <Card padding="none">
        <EmptyState
          icon={Users}
          title="No tenants yet"
          description="Register a tenant to assign them a unit and start collecting rent."
        />
      </Card>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <Table>
        <THead>
          <TH>Name</TH>
          <TH>Contact</TH>
          <TH>Unit</TH>
          <TH>Lease</TH>
          <TH>Status</TH>
        </THead>
        <TBody>
          {tenants.map((tenant) => {
            const lease = tenant.leases?.[0];
            const unit = lease?.units;
            const leaseStatus = lease?.status || 'pending';
            const statusConfig = LEASE_STATUSES[leaseStatus];
            return (
              <TR key={tenant.id}>
                <TD className="font-medium text-gray-900">{tenant.full_name}</TD>
                <TD>
                  <div>{tenant.email}</div>
                  <div className="text-xs text-gray-400">{tenant.phone}</div>
                </TD>
                <TD>{unit ? `${unit.unit_number} · ${unit.buildings?.name || ''}` : '—'}</TD>
                <TD>{lease ? `${formatDate(lease.start_date)} – ${formatDate(lease.end_date)}` : '—'}</TD>
                <TD>
                  <Badge variant={statusConfig.color as 'green' | 'gray' | 'red' | 'yellow'}>{statusConfig.label}</Badge>
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>
    </Card>
  );
}
