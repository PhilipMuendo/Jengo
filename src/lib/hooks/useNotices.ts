'use client';

import { useState, useEffect, useCallback } from 'react';
import { getNotices } from '@/services/notices';
import type { Notice } from '@/types/database.types';

export function useNotices(orgId?: string) {
  const [notices, setNotices] = useState<(Notice & { buildings?: { name: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getNotices(orgId);
      setNotices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  return { notices, loading, error, refresh };
}
