'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSessionUser } from '@/services/auth';
import type { User } from '@/types/database.types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await getSessionUser();
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, loading, refresh, isOwner: user?.role === 'owner' };
}
