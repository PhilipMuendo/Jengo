'use client';

import { useSupabaseQuery } from '@/lib/hooks/useSupabaseQuery';
import { getUnits } from '@/services/units';

export function useUnits(orgId?: string) {
  const { data, loading, error, refresh } = useSupabaseQuery(
    ['units', orgId],
    () => getUnits(orgId!),
    !!orgId,
  );
  return { units: data ?? [], loading, error, refresh };
}
