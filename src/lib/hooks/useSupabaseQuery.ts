'use client';

import { useQuery, type QueryKey } from '@tanstack/react-query';

interface QueryResult<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Thin wrapper over TanStack Query that preserves the `{ data, loading, error,
 * refresh }` shape the domain hooks already expose, so page consumers don't
 * change. Adds caching, request dedup, and automatic cancellation on unmount.
 */
export function useSupabaseQuery<T>(
  key: QueryKey,
  fn: () => Promise<T>,
  enabled = true,
): QueryResult<T> {
  const query = useQuery({ queryKey: key, queryFn: fn, enabled });
  return {
    data: query.data,
    loading: query.isPending && enabled,
    error: query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refresh: () => void query.refetch(),
  };
}
