'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPayments, type PaymentWithRelations } from '@/services/payments';

export function usePayments(orgId?: string) {
  const [payments, setPayments] = useState<PaymentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getPayments(orgId);
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { payments, loading, error, refresh };
}
