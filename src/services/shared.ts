import type { Page } from '@/lib/hooks/usePaginatedQuery';

/**
 * Org-scoping paths shared by every browser-side list query. RLS already
 * restricts rows to the caller's organization; these explicit filters are
 * defense-in-depth and keep query plans on the org indexes. Tables reach
 * their organization three ways:
 *   - directly            (buildings, notices, users)
 *   - via their building  (units)
 *   - via unit → building (leases, invoices, payments, maintenance_requests)
 */
export const ORG_FILTER = {
  direct: 'organization_id',
  viaBuilding: 'buildings.organization_id',
  viaUnit: 'units.buildings.organization_id',
} as const;

export function pageRange(page: number, pageSize: number): [from: number, to: number] {
  const from = page * pageSize;
  return [from, from + pageSize - 1];
}

/** Unwraps a Supabase `{ data, count, error }` result into a `Page`, throwing on error. */
export function toPage<T>(result: {
  data: unknown;
  count: number | null;
  error: { message: string } | null;
}): Page<T> {
  if (result.error) throw new Error(result.error.message);
  return { rows: (result.data as T[]) ?? [], count: result.count ?? 0 };
}
