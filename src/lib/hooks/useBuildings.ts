'use client';

import { useSupabaseQuery } from '@/lib/hooks/useSupabaseQuery';
import { getBuildings } from '@/services/buildings';

export function useBuildings(orgId?: string) {
  const { data, loading, error, refresh } = useSupabaseQuery(
    ['buildings', orgId],
    () => getBuildings(orgId!),
    !!orgId,
  );
  return { buildings: data ?? [], loading, error, refresh };
}
