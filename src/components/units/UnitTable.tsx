'use client';

import Link from 'next/link';
import { DoorOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { UnitStatusBadge } from './UnitStatusBadge';
import { formatKES } from '@/lib/utils/currency';
import type { UnitWithBuilding } from '@/services/units';

interface UnitTableProps {
  units: UnitWithBuilding[];
  loading?: boolean;
}

export function UnitTable({ units, loading }: UnitTableProps) {
  if (loading) {
    return (
      <Card padding="none">
        <div className="space-y-3 p-6">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </Card>
    );
  }

  if (!units.length) {
    return (
      <Card padding="none">
        <EmptyState
          icon={DoorOpen}
          title="No units yet"
          description="Add units to a building to start assigning tenants."
          action={
            <Link href="/units/new">
              <Button size="sm">Add your first unit</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <Table>
        <THead>
          <TH>Unit</TH>
          <TH>Building</TH>
          <TH>Bed/Bath</TH>
          <TH>Rent</TH>
          <TH>Status</TH>
        </THead>
        <TBody>
          {units.map((unit) => (
            <TR key={unit.id}>
              <TD className="font-medium text-gray-900">{unit.unit_number}</TD>
              <TD>{unit.buildings?.name || '—'}</TD>
              <TD>{unit.bedrooms}BR / {unit.bathrooms}BA</TD>
              <TD className="tabular-nums text-gray-900">{formatKES(unit.rent_amount)}</TD>
              <TD><UnitStatusBadge status={unit.status} /></TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </Card>
  );
}
