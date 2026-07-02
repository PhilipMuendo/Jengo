'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMaintenanceRequests, type MaintenanceWithRelations } from '@/services/maintenance';

export function useMaintenance(orgId?: string) {
  const [requests, setRequests] = useState<MaintenanceWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMaintenanceRequests(orgId);
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  return { requests, loading, error, refresh };
}
