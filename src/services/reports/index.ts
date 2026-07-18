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

/**
 * Single aggregate query (`get_org_dashboard_summary`, migration 0004).
 * Errors surface — no silent fetch-every-row fallback.
 */
export async function getReportSummary(orgId: string): Promise<ReportSummary> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_org_dashboard_summary', { p_org_id: orgId });
  if (error) {
    throw new Error(`get_org_dashboard_summary failed (is migration 0004 deployed?): ${error.message}`);
  }
  const row = (data as DashboardSummaryRow[] | null)?.[0];
  if (!row) throw new Error('get_org_dashboard_summary returned no rows');

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
