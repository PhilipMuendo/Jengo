import { createClient } from '@/lib/supabase/client';
import type { User, Lease } from '@/types/database.types';
import type { TenantInput } from '@/lib/validations/tenant.schema';

export type TenantWithLease = User & {
  leases?: (Lease & { units?: { unit_number: string; buildings?: { name: string } } })[];
};

export async function getTenants(orgId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*, leases(*, units(unit_number, buildings(name)))')
    .eq('organization_id', orgId)
    .eq('role', 'tenant')
    .order('full_name');
  if (error) throw error;
  return data as TenantWithLease[];
}

export async function getTenantsPage(
  orgId: string,
  page: number,
  pageSize: number,
): Promise<{ rows: TenantWithLease[]; count: number }> {
  const supabase = createClient();
  const from = page * pageSize;
  const { data, count, error } = await supabase
    .from('users')
    .select('*, leases(*, units(unit_number, buildings(name)))', { count: 'exact' })
    .eq('organization_id', orgId)
    .eq('role', 'tenant')
    .order('full_name')
    .range(from, from + pageSize - 1);
  if (error) throw error;
  return { rows: (data as TenantWithLease[]) ?? [], count: count ?? 0 };
}

export async function createTenant(orgId: string, input: TenantInput, password: string) {
  const supabase = createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: input.email,
    password,
    options: { data: { full_name: input.full_name } },
  });
  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to create tenant account');

  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      organization_id: orgId,
      email: input.email,
      phone: input.phone,
      full_name: input.full_name,
      id_number: input.id_number || null,
      role: 'tenant',
      is_active: true,
      building_access: [],
      preferences: {},
    })
    .select()
    .single();
  if (userError) throw userError;

  const { data: lease, error: leaseError } = await supabase
    .from('leases')
    .insert({
      unit_id: input.unit_id,
      tenant_id: authData.user.id,
      start_date: input.start_date,
      end_date: input.end_date,
      monthly_rent: input.monthly_rent,
      deposit_amount: input.deposit_amount,
      deposit_paid: false,
      status: 'active',
      terms: {},
    })
    .select()
    .single();
  if (leaseError) throw leaseError;

  await supabase.from('units').update({ status: 'occupied' }).eq('id', input.unit_id);

  return { user, lease };
}
