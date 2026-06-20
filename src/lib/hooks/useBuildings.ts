'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBuildings } from '@/services/buildings';
import type { Building } from '@/types/database.types';

export function useBuildings(orgId?: string) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getBuildings(orgId);
      setBuildings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load buildings');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { buildings, loading, error, refresh };
}
