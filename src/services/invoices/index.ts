import { createClient } from '@/lib/supabase/client';
import { ORG_FILTER, pageRange, toPage } from '@/services/shared';
import type { Page } from '@/lib/hooks/usePaginatedQuery';
import type { Invoice } from '@/types/database.types';

export type InvoiceWithRelations = Invoice & {
  users?: { full_name: string; phone: string };
  units?: { unit_number: string; buildings?: { name: string } };
};

const INVOICE_SELECT =
  '*, users!invoices_tenant_id_fkey(full_name, phone), units!inner(unit_number, buildings!inner(name, organization_id))';

export async function getInvoicesPage(
  orgId: string,
  page: number,
  pageSize: number,
): Promise<Page<InvoiceWithRelations>> {
  const supabase = createClient();
  const [from, to] = pageRange(page, pageSize);
  return toPage<InvoiceWithRelations>(
    await supabase
      .from('invoices')
      .select(INVOICE_SELECT, { count: 'exact' })
      .eq(ORG_FILTER.viaUnit, orgId)
      .order('due_date', { ascending: false })
      .range(from, to),
  );
}

export async function getOverdueInvoicesPage(
  orgId: string,
  page: number,
  pageSize: number,
): Promise<Page<InvoiceWithRelations>> {
  const supabase = createClient();
  const [from, to] = pageRange(page, pageSize);
  return toPage<InvoiceWithRelations>(
    await supabase
      .from('invoices')
      .select(INVOICE_SELECT, { count: 'exact' })
      .eq(ORG_FILTER.viaUnit, orgId)
      .eq('status', 'overdue')
      .order('due_date')
      .range(from, to),
  );
}

export interface ArrearsSummary {
  overdueAmount: number;
  overdueTenants: number;
}

/** Aggregate arrears figures from the dashboard summary RPC (migration 0004). */
export async function getArrearsSummary(orgId: string): Promise<ArrearsSummary> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_org_dashboard_summary', { p_org_id: orgId });
  if (error) throw new Error(error.message);
  const row = (data as { overdue_amount: number | string; overdue_tenants: number }[] | null)?.[0];
  return {
    overdueAmount: Number(row?.overdue_amount ?? 0),
    overdueTenants: row?.overdue_tenants ?? 0,
  };
}

export async function getInvoicesByTenant(tenantId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('due_date', { ascending: false });
  if (error) throw error;
  return data as Invoice[];
}
