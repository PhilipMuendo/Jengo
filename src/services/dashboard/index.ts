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
 * (migration 0003). Falls back to per-metric queries if not yet deployed.
 */
export async function getDashboardData(
  supabase: ServerSupabase,
  orgId: string,
): Promise<DashboardData> {
  const { data, error } = await supabase.rpc('get_org_dashboard_summary', { p_org_id: orgId });
  const row = (data as DashboardSummaryRow[] | null)?.[0];
  if (!error && row) {
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

  const [{ count: buildingCount }, { data: units }, attention] = await Promise.all([
    supabase.from('buildings').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase
      .from('units')
      .select('status, buildings!inner(organization_id)')
      .eq('buildings.organization_id', orgId),
    getAttentionSummary(supabase, orgId),
  ]);

  const unitRows = (units ?? []) as { status: string }[];
  const unitCount = unitRows.length;
  const occupiedCount = unitRows.filter((u) => u.status === 'occupied').length;
  return {
    buildingCount: buildingCount ?? 0,
    unitCount,
    occupiedCount,
    occupancyRate: unitCount ? Math.round((occupiedCount / unitCount) * 100) : 0,
    attention,
  };
}

/**
 * Confirmed revenue bucketed by month for the last `months` months
 * (migration 0003). Falls back to a rows-and-bucket query if not deployed.
 */
export async function getRevenueTrend(
  supabase: ServerSupabase,
  orgId: string,
  months = 6,
): Promise<RevenuePoint[]> {
  const { data, error } = await supabase.rpc('get_org_revenue_trend', {
    p_org_id: orgId,
    p_months: months,
  });
  const rows = data as RevenueTrendRow[] | null;
  if (!error && rows) {
    return rows.map((r) => ({ month: monthLabel(r.month_start), revenue: Number(r.revenue) }));
  }

  const trendStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - (months - 1),
    1,
  ).toISOString();
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, payment_date, units!inner(buildings!inner(organization_id))')
    .eq('status', 'confirmed')
    .eq('units.buildings.organization_id', orgId)
    .gte('payment_date', trendStart);

  return buildRevenueTrend(
    (payments ?? []) as { amount: number | string; payment_date: string }[],
    months,
  );
}

/**
 * Buckets confirmed payments into the last `months` calendar months.
 * Pure function; also used as the fallback path for {@link getRevenueTrend}.
 */
export function buildRevenueTrend(
  payments: { amount: number | string; payment_date: string }[],
  months = 6,
): RevenuePoint[] {
  const now = new Date();
  const buckets: RevenuePoint[] = [];
  const indexByKey = new Map<string, number>();

  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    indexByKey.set(`${d.getFullYear()}-${d.getMonth()}`, buckets.length);
    buckets.push({ month: d.toLocaleString('en-US', { month: 'short' }), revenue: 0 });
  }

  for (const p of payments) {
    const d = new Date(p.payment_date);
    const idx = indexByKey.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (idx !== undefined) buckets[idx].revenue += Number(p.amount);
  }

  return buckets;
}

interface OverdueInvoiceRow {
  tenant_id: string;
  amount: number | string;
  late_fee: number | string | null;
}

interface MaintenanceRow {
  priority: string;
}

export async function getAttentionSummary(
  supabase: ServerSupabase,
  orgId: string,
): Promise<AttentionSummary> {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const in30Str = new Date(today.getTime() + 30 * 86_400_000).toISOString().slice(0, 10);

  const [overdue, leases, maintenance] = await Promise.all([
    supabase
      .from('invoices')
      .select('tenant_id, amount, late_fee, units!inner(buildings!inner(organization_id))')
      .eq('status', 'overdue')
      .eq('units.buildings.organization_id', orgId),
    supabase
      .from('leases')
      .select('id, units!inner(buildings!inner(organization_id))', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('end_date', todayStr)
      .lte('end_date', in30Str)
      .eq('units.buildings.organization_id', orgId),
    supabase
      .from('maintenance_requests')
      .select('priority, units!inner(buildings!inner(organization_id))')
      .in('status', ['open', 'assigned', 'in_progress'])
      .eq('units.buildings.organization_id', orgId),
  ]);

  const overdueRows = (overdue.data ?? []) as unknown as OverdueInvoiceRow[];
  const maintenanceRows = (maintenance.data ?? []) as unknown as MaintenanceRow[];

  const arrearsTenants = new Set(overdueRows.map((r) => r.tenant_id));
  const arrearsTotal = overdueRows.reduce(
    (sum, r) => sum + Number(r.amount) + Number(r.late_fee ?? 0),
    0,
  );

  return {
    arrears: { count: arrearsTenants.size, total: arrearsTotal },
    expiringLeases: { count: leases.count ?? 0 },
    maintenance: {
      open: maintenanceRows.length,
      urgent: maintenanceRows.filter((m) => m.priority === 'urgent').length,
    },
  };
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
