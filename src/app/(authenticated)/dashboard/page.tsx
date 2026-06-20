import { Topbar } from '@/components/layout/Topbar';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { AttentionItems } from '@/components/dashboard/AttentionItems';
import { getCurrentUser } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { count: buildingCount } = await supabase
    .from('buildings')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', user!.organization_id);

  const { count: unitCount } = await supabase
    .from('units')
    .select('*, buildings!inner(organization_id)', { count: 'exact', head: true })
    .eq('buildings.organization_id', user!.organization_id);

  const { count: occupiedCount } = await supabase
    .from('units')
    .select('*, buildings!inner(organization_id)', { count: 'exact', head: true })
    .eq('buildings.organization_id', user!.organization_id)
    .eq('status', 'occupied');

  const { data: recentPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'confirmed')
    .gte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  const monthlyRevenue = recentPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const occupancyRate = unitCount ? Math.round(((occupiedCount || 0) / unitCount) * 100) : 0;

  return (
    <div>
      <Topbar
        title="Dashboard"
        subtitle="Portfolio overview"
        role={user!.role}
      />
      <div className="p-6 space-y-6">
        <StatsGrid
          stats={[
            { label: 'Buildings', value: buildingCount || 0, change: '+0%' },
            { label: 'Total Units', value: unitCount || 0, change: '+0%' },
            { label: 'Occupancy', value: `${occupancyRate}%`, change: '+0%' },
            { label: 'Monthly Revenue', value: monthlyRevenue, isCurrency: true, change: '+0%' },
          ]}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <OccupancyChart occupancyRate={occupancyRate} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AttentionItems />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
