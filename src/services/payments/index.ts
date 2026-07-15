import { createClient } from '@/lib/supabase/client';
import type { Payment } from '@/types/database.types';
import type { PaymentInput } from '@/lib/validations/payment.schema';

export type PaymentWithRelations = Payment & {
  users?: { full_name: string };
  units?: { unit_number: string };
};

export async function getPayments(orgId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('payments')
    .select('*, users!payments_tenant_id_fkey(full_name), units(unit_number, buildings!inner(organization_id))')
    .eq('units.buildings.organization_id', orgId)
    .order('payment_date', { ascending: false });
  if (error) throw error;
  return data as PaymentWithRelations[];
}

export async function getPaymentsPage(
  orgId: string,
  page: number,
  pageSize: number,
): Promise<{ rows: PaymentWithRelations[]; count: number }> {
  const supabase = createClient();
  const from = page * pageSize;
  const { data, count, error } = await supabase
    .from('payments')
    .select(
      '*, users!payments_tenant_id_fkey(full_name), units!inner(unit_number, buildings!inner(organization_id))',
      { count: 'exact' },
    )
    .eq('units.buildings.organization_id', orgId)
    .order('payment_date', { ascending: false })
    .range(from, from + pageSize - 1);
  if (error) throw error;
  return { rows: (data as PaymentWithRelations[]) ?? [], count: count ?? 0 };
}

export async function getPaymentsByTenant(tenantId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('payment_date', { ascending: false });
  if (error) throw error;
  return data as Payment[];
}

export async function recordPayment(input: PaymentInput, confirmedBy?: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('payments')
    .insert({
      ...input,
      status: 'confirmed',
      payment_date: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
      confirmed_by: confirmedBy || null,
      metadata: {},
    })
    .select()
    .single();
  if (error) throw error;
  return data as Payment;
}

export async function initiateMpesaPayment(payload: {
  phone: string;
  amount: number;
  invoiceId: string;
  unitId: string;
}) {
  const response = await fetch('/api/payments/mpesa/stk-push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: payload.phone,
      amount: payload.amount,
      invoice_id: payload.invoiceId,
      unit_id: payload.unitId,
    }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'M-Pesa payment failed');
  return json.data as { checkoutRequestId: string; merchantRequestId: string; responseDescription: string };
}
