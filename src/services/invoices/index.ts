import { createClient } from '@/lib/supabase/client';
import type { Invoice } from '@/types/database.types';

export type InvoiceWithRelations = Invoice & {
  users?: { full_name: string; phone: string };
  units?: { unit_number: string; buildings?: { name: string } };
};

export async function getInvoices(orgId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*, users!invoices_tenant_id_fkey(full_name, phone), units(unit_number, buildings!inner(name, organization_id))')
    .eq('units.buildings.organization_id', orgId)
    .order('due_date', { ascending: false });
  if (error) throw error;
  return data as InvoiceWithRelations[];
}

export async function getOverdueInvoices(orgId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*, users!invoices_tenant_id_fkey(full_name, phone), units(unit_number, buildings!inner(name, organization_id))')
    .eq('units.buildings.organization_id', orgId)
    .eq('status', 'overdue')
    .order('due_date');
  if (error) throw error;
  return data as InvoiceWithRelations[];
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
