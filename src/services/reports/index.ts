import { createClient } from '@/lib/supabase/client';

export interface ReportSummary {
  totalBuildings: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalTenants: number;
  monthlyRevenue: number;
  overdueAmount: number;
  openMaintenance: number;
  occupancyRate: number;
}

interface DashboardSummaryRow {
  building_count: number;
  unit_count: number;
  occupied_units: number;
  vacant_units: number;
  active_tenants: number;
  monthly_revenue: number | string;
  overdue_amount: number | string;
  open_maintenance: number;
}

type BrowserSupabase = ReturnType<typeof createClient>;

export async function getReportSummary(orgId: string): Promise<ReportSummary> {
  const supabase = createClient();

  // Fast path: a single aggregate query (migration 0003). Falls back to the
  // per-metric queries below if the function isn't deployed yet.
  const { data, error } = await supabase.rpc('get_org_dashboard_summary', { p_org_id: orgId });
  const row = (data as DashboardSummaryRow[] | null)?.[0];
  if (!error && row) {
    const totalUnits = row.unit_count;
    return {
      totalBuildings: row.building_count,
      totalUnits,
      occupiedUnits: row.occupied_units,
      vacantUnits: row.vacant_units,
      totalTenants: row.active_tenants,
      monthlyRevenue: Number(row.monthly_revenue),
      overdueAmount: Number(row.overdue_amount),
      openMaintenance: row.open_maintenance,
      occupancyRate: totalUnits ? Math.round((row.occupied_units / totalUnits) * 100) : 0,
    };
  }

  return getReportSummaryViaQueries(supabase, orgId);
}

/** Fallback used until `get_org_dashboard_summary` is deployed. */
async function getReportSummaryViaQueries(
  supabase: BrowserSupabase,
  orgId: string,
): Promise<ReportSummary> {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const [
    { count: totalBuildings },
    { data: units },
    { count: totalTenants },
    { data: payments },
    { data: overdueInvoices },
    { count: openMaintenance },
  ] = await Promise.all([
    supabase
      .from('buildings')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId),
    supabase
      .from('units')
      .select('status, buildings!inner(organization_id)')
      .eq('buildings.organization_id', orgId),
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('role', 'tenant')
      .eq('is_active', true),
    supabase
      .from('payments')
      .select('amount, units!inner(buildings!inner(organization_id))')
      .eq('status', 'confirmed')
      .eq('units.buildings.organization_id', orgId)
      .gte('payment_date', monthStart),
    supabase
      .from('invoices')
      .select('amount, units!inner(buildings!inner(organization_id))')
      .eq('status', 'overdue')
      .eq('units.buildings.organization_id', orgId),
    supabase
      .from('maintenance_requests')
      .select('*, units!inner(buildings!inner(organization_id))', { count: 'exact', head: true })
      .eq('units.buildings.organization_id', orgId)
      .in('status', ['open', 'assigned', 'in_progress']),
  ]);

  const monthlyRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const overdueAmount = overdueInvoices?.reduce((sum, i) => sum + Number(i.amount), 0) || 0;
  const totalUnits = units?.length || 0;
  const occupiedUnits = units?.filter((u) => u.status === 'occupied').length || 0;
  const vacantUnits = units?.filter((u) => u.status === 'vacant').length || 0;

  return {
    totalBuildings: totalBuildings || 0,
    totalUnits,
    occupiedUnits,
    vacantUnits,
    totalTenants: totalTenants || 0,
    monthlyRevenue,
    overdueAmount,
    openMaintenance: openMaintenance || 0,
    occupancyRate: totalUnits ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
  };
}
