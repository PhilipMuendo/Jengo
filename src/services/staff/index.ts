import { createClient } from '@/lib/supabase/client';
import { ORG_FILTER, pageRange, toPage } from '@/services/shared';
import type { Page } from '@/lib/hooks/usePaginatedQuery';
import type { User } from '@/types/database.types';
import type { StaffInput } from '@/lib/validations/staff.schema';

export async function getStaffPage(
  orgId: string,
  page: number,
  pageSize: number,
): Promise<Page<User>> {
  const supabase = createClient();
  const [from, to] = pageRange(page, pageSize);
  return toPage<User>(
    await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq(ORG_FILTER.direct, orgId)
      .in('role', ['property_manager', 'caretaker'])
      .order('full_name')
      .range(from, to),
  );
}

/** Staff accounts are created server-side (/api/staff) — see createTenant. */
export async function createStaffMember(_orgId: string, input: StaffInput, password: string) {
  const response = await fetch('/api/staff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, password }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to add staff member');
  return json.data as User;
}
