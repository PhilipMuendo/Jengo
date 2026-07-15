'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';
import type { RevenuePoint } from '@/services/dashboard';

const RevenueChart = dynamic(
  () => import('./RevenueChart').then((m) => m.RevenueChart),
  { ssr: false, loading: () => <Skeleton className="h-[328px] rounded-xl" /> }
);

const OccupancyChart = dynamic(
  () => import('./OccupancyChart').then((m) => m.OccupancyChart),
  { ssr: false, loading: () => <Skeleton className="h-[328px] rounded-xl" /> }
);

export function ChartsSection({
  occupancyRate,
  revenueData,
}: {
  occupancyRate: number;
  revenueData: RevenuePoint[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RevenueChart data={revenueData} />
      <OccupancyChart occupancyRate={occupancyRate} />
    </div>
  );
}
