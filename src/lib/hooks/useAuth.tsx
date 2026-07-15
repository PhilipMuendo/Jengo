'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { User } from '@/types/database.types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isOwner: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ user, children }: { user: User | null; children: ReactNode }) {
  const value: AuthContextValue = { user, loading: false, isOwner: user?.role === 'owner' };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
