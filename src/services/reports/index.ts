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

export async function getReportSummary(orgId: string): Promise<ReportSummary> {
  const supabase = createClient();

  const { count: totalBuildings } = await supabase
    .from('buildings')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId);

  const { count: totalUnits } = await supabase
    .from('units')
    .select('*, buildings!inner(organization_id)', { count: 'exact', head: true })
    .eq('buildings.organization_id', orgId);

  const { count: occupiedUnits } = await supabase
    .from('units')
    .select('*, buildings!inner(organization_id)', { count: 'exact', head: true })
    .eq('buildings.organization_id', orgId)
    .eq('status', 'occupied');

  const { count: vacantUnits } = await supabase
    .from('units')
    .select('*, buildings!inner(organization_id)', { count: 'exact', head: true })
    .eq('buildings.organization_id', orgId)
    .eq('status', 'vacant');

  const { count: totalTenants } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('role', 'tenant')
    .eq('is_active', true);

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, units!inner(buildings!inner(organization_id))')
    .eq('status', 'confirmed')
    .eq('units.buildings.organization_id', orgId)
    .gte('payment_date', monthStart);

  const { data: overdueInvoices } = await supabase
    .from('invoices')
    .select('amount, units!inner(buildings!inner(organization_id))')
    .eq('status', 'overdue')
    .eq('units.buildings.organization_id', orgId);

  const { count: openMaintenance } = await supabase
    .from('maintenance_requests')
    .select('*, units!inner(buildings!inner(organization_id))', { count: 'exact', head: true })
    .eq('units.buildings.organization_id', orgId)
    .in('status', ['open', 'assigned', 'in_progress']);

  const monthlyRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const overdueAmount = overdueInvoices?.reduce((sum, i) => sum + Number(i.amount), 0) || 0;
  const units = totalUnits || 0;
  const occupied = occupiedUnits || 0;

  return {
    totalBuildings: totalBuildings || 0,
    totalUnits: units,
    occupiedUnits: occupied,
    vacantUnits: vacantUnits || 0,
    totalTenants: totalTenants || 0,
    monthlyRevenue,
    overdueAmount,
    openMaintenance: openMaintenance || 0,
    occupancyRate: units ? Math.round((occupied / units) * 100) : 0,
  };
}
