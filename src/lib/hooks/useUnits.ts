'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUnits, type UnitWithBuilding } from '@/services/units';

export function useUnits(orgId?: string) {
  const [units, setUnits] = useState<UnitWithBuilding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUnits(orgId);
      setUnits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load units');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  return { units, loading, error, refresh };
}
