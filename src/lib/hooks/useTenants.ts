'use client';

import { useSupabaseQuery } from '@/lib/hooks/useSupabaseQuery';
import { getTenants } from '@/services/tenants';

export function useTenants(orgId?: string) {
  const { data, loading, error, refresh } = useSupabaseQuery(
    ['tenants', orgId],
    () => getTenants(orgId!),
    !!orgId,
  );
  return { tenants: data ?? [], loading, error, refresh };
}
