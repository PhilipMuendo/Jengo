'use client';

import { useState, useEffect, useCallback } from 'react';
import { getStaff } from '@/services/staff';
import type { User } from '@/types/database.types';

export function useStaff(orgId?: string) {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getStaff(orgId);
      setStaff(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { staff, loading, error, refresh };
}
