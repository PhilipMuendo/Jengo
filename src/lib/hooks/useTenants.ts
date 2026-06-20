'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTenants, type TenantWithLease } from '@/services/tenants';

export function useTenants(orgId?: string) {
  const [tenants, setTenants] = useState<TenantWithLease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTenants(orgId);
      setTenants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tenants, loading, error, refresh };
}
