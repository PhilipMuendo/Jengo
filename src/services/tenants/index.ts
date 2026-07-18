import { createClient } from '@/lib/supabase/client';
import { ORG_FILTER, pageRange, toPage } from '@/services/shared';
import type { Page } from '@/lib/hooks/usePaginatedQuery';
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
): Promise<Page<TenantWithLease>> {
  const supabase = createClient();
  const [from, to] = pageRange(page, pageSize);
  return toPage<TenantWithLease>(
    await supabase
      .from('users')
      .select('*, leases(*, units(unit_number, buildings(name)))', { count: 'exact' })
      .eq(ORG_FILTER.direct, orgId)
      .eq('role', 'tenant')
      .order('full_name')
      .range(from, to),
  );
}

/**
 * Tenant accounts are created server-side (/api/tenants): browser-side
 * auth.signUp would replace the staff member's own session with the new
 * tenant's, and the signup DB trigger needs organization metadata only the
 * server attaches.
 */
export async function createTenant(_orgId: string, input: TenantInput, password: string) {
  const response = await fetch('/api/tenants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, password }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to create tenant');
  return json.data as { userId: string; leaseId: string };
}
