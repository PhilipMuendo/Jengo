'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
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
        <div className="p-6 space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </Card>
    );
  }

  if (!units.length) {
    return (
      <Card>
        <p className="text-gray-500 text-center py-8">No units found. <Link href="/units/new" className="text-emerald-600 hover:underline">Add your first unit</Link></p>
      </Card>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Unit</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Building</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Bed/Bath</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Rent</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {units.map((unit) => (
              <tr key={unit.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{unit.unit_number}</td>
                <td className="px-6 py-4 text-gray-600">{unit.buildings?.name || '—'}</td>
                <td className="px-6 py-4 text-gray-600">{unit.bedrooms}BR / {unit.bathrooms}BA</td>
                <td className="px-6 py-4 text-gray-900">{formatKES(unit.rent_amount)}</td>
                <td className="px-6 py-4"><UnitStatusBadge status={unit.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
