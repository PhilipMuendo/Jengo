import { Topbar } from '@/components/layout/Topbar';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { ChartsSection } from '@/components/dashboard/ChartsSection';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { AttentionItems } from '@/components/dashboard/AttentionItems';
import { getCurrentUser } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import {
  getDashboardData,
  getRevenueTrend,
  getRecentActivity,
} from '@/services/dashboard';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const orgId = user!.organization_id;

  const [dashboard, revenueData, activities] = await Promise.all([
    getDashboardData(supabase, orgId),
    getRevenueTrend(supabase, orgId),
    getRecentActivity(supabase, orgId),
  ]);

  const { buildingCount, unitCount, occupancyRate, attention } = dashboard;

  // Current-month revenue is the last trend bucket; month-over-month change
  // is derived from the two most recent buckets.
  const thisMonth = revenueData[revenueData.length - 1]?.revenue ?? 0;
  const lastMonth = revenueData[revenueData.length - 2]?.revenue ?? 0;
  const monthlyRevenue = thisMonth;
  const revenueChange =
    lastMonth > 0
      ? `${thisMonth >= lastMonth ? '+' : ''}${Math.round(((thisMonth - lastMonth) / lastMonth) * 100)}%`
      : undefined;

  return (
    <div>
      <Topbar
        title="Dashboard"
        subtitle="Portfolio overview"
        role={user!.role}
      />
      <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6">
        <StatsGrid
          stats={[
            { label: 'Buildings', value: buildingCount },
            { label: 'Total Units', value: unitCount },
            { label: 'Occupancy', value: `${occupancyRate}%` },
            { label: 'Monthly Revenue', value: monthlyRevenue, isCurrency: true, change: revenueChange },
          ]}
        />
        <ChartsSection occupancyRate={occupancyRate} revenueData={revenueData} />
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Needs attention
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AttentionItems summary={attention} />
            <ActivityFeed activities={activities} />
          </div>
        </section>
      </div>
    </div>
  );
}
