import type { createClient } from '@/lib/supabase/server';
import { formatKES } from '@/lib/utils/currency';

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface AttentionSummary {
  arrears: { count: number; total: number };
  expiringLeases: { count: number };
  maintenance: { open: number; urgent: number };
}

export interface ActivityItem {
  id: string;
  action: string;
  detail: string;
  time: string;
}

export interface DashboardData {
  buildingCount: number;
  unitCount: number;
  occupiedCount: number;
  occupancyRate: number;
  attention: AttentionSummary;
}

interface DashboardSummaryRow {
  building_count: number;
  unit_count: number;
  occupied_units: number;
  vacant_units: number;
  active_tenants: number;
  monthly_revenue: number | string;
  overdue_amount: number | string;
  overdue_tenants: number;
  open_maintenance: number;
  urgent_maintenance: number;
  expiring_leases: number;
}

interface RevenueTrendRow {
  month_start: string;
  revenue: number | string;
}

function monthLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', { month: 'short' });
}

/**
 * Portfolio counts + attention summary in a single aggregate query
 * (`get_org_dashboard_summary`, migration 0004). Requires the migration to
 * be deployed — RPC errors surface instead of silently degrading into
 * fetch-every-row fallback queries.
 */
export async function getDashboardData(
  supabase: ServerSupabase,
  orgId: string,
): Promise<DashboardData> {
  const { data, error } = await supabase.rpc('get_org_dashboard_summary', { p_org_id: orgId });
  if (error) {
    throw new Error(`get_org_dashboard_summary failed (is migration 0004 deployed?): ${error.message}`);
  }
  const row = (data as DashboardSummaryRow[] | null)?.[0];
  if (!row) throw new Error('get_org_dashboard_summary returned no rows');

  return {
    buildingCount: row.building_count,
    unitCount: row.unit_count,
    occupiedCount: row.occupied_units,
    occupancyRate: row.unit_count ? Math.round((row.occupied_units / row.unit_count) * 100) : 0,
    attention: {
      arrears: { count: row.overdue_tenants, total: Number(row.overdue_amount) },
      expiringLeases: { count: row.expiring_leases },
      maintenance: { open: row.open_maintenance, urgent: row.urgent_maintenance },
    },
  };
}

/** Confirmed revenue bucketed by month (`get_org_revenue_trend`, migration 0004). */
export async function getRevenueTrend(
  supabase: ServerSupabase,
  orgId: string,
  months = 6,
): Promise<RevenuePoint[]> {
  const { data, error } = await supabase.rpc('get_org_revenue_trend', {
    p_org_id: orgId,
    p_months: months,
  });
  if (error) {
    throw new Error(`get_org_revenue_trend failed (is migration 0004 deployed?): ${error.message}`);
  }
  const rows = (data as RevenueTrendRow[] | null) ?? [];
  return rows.map((r) => ({ month: monthLabel(r.month_start), revenue: Number(r.revenue) }));
}

interface PaymentActivityRow {
  id: string;
  amount: number | string;
  payment_date: string;
  units: { unit_number: string } | null;
}

interface TenantActivityRow {
  id: string;
  full_name: string;
  created_at: string;
}

interface MaintenanceActivityRow {
  id: string;
  title: string;
  resolved_at: string | null;
  units: { unit_number: string } | null;
}

interface InvoiceActivityRow {
  id: string;
  invoice_number: string;
  amount: number | string;
  created_at: string;
}

export async function getRecentActivity(
  supabase: ServerSupabase,
  orgId: string,
  limit = 5,
): Promise<ActivityItem[]> {
  const [payments, tenants, maintenance, invoices] = await Promise.all([
    supabase
      .from('payments')
      .select('id, amount, payment_date, units!inner(unit_number, buildings!inner(organization_id))')
      .eq('status', 'confirmed')
      .eq('units.buildings.organization_id', orgId)
      .order('payment_date', { ascending: false })
      .limit(limit),
    supabase
      .from('users')
      .select('id, full_name, created_at')
      .eq('organization_id', orgId)
      .eq('role', 'tenant')
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('maintenance_requests')
      .select('id, title, resolved_at, units!inner(unit_number, buildings!inner(organization_id))')
      .eq('status', 'resolved')
      .not('resolved_at', 'is', null)
      .eq('units.buildings.organization_id', orgId)
      .order('resolved_at', { ascending: false })
      .limit(limit),
    supabase
      .from('invoices')
      .select('id, invoice_number, amount, created_at, units!inner(buildings!inner(organization_id))')
      .eq('units.buildings.organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit),
  ]);

  const items: ActivityItem[] = [];

  for (const p of (payments.data ?? []) as unknown as PaymentActivityRow[]) {
    items.push({
      id: `payment-${p.id}`,
      action: 'Rent payment received',
      detail: `Unit ${p.units?.unit_number ?? '—'} — ${formatKES(Number(p.amount))}`,
      time: p.payment_date,
    });
  }

  for (const t of (tenants.data ?? []) as unknown as TenantActivityRow[]) {
    items.push({
      id: `tenant-${t.id}`,
      action: 'New tenant added',
      detail: t.full_name,
      time: t.created_at,
    });
  }

  for (const m of (maintenance.data ?? []) as unknown as MaintenanceActivityRow[]) {
    if (!m.resolved_at) continue;
    items.push({
      id: `maintenance-${m.id}`,
      action: 'Maintenance resolved',
      detail: `${m.title} — Unit ${m.units?.unit_number ?? '—'}`,
      time: m.resolved_at,
    });
  }

  for (const inv of (invoices.data ?? []) as unknown as InvoiceActivityRow[]) {
    items.push({
      id: `invoice-${inv.id}`,
      action: 'Invoice generated',
      detail: `${inv.invoice_number} — ${formatKES(Number(inv.amount))}`,
      time: inv.created_at,
    });
  }

  return items
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, limit);
}
