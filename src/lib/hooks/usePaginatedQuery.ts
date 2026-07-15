'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData, type QueryKey } from '@tanstack/react-query';

export interface Page<T> {
  rows: T[];
  count: number;
}

const DEFAULT_PAGE_SIZE = 25;

/**
 * Server-side paginated query. Keeps the previous page visible while the next
 * one loads (no flash of empty table), and derives page-count from the exact row
 * count returned alongside the data.
 */
export function usePaginatedQuery<T>(
  baseKey: QueryKey,
  fetcher: (page: number, pageSize: number) => Promise<Page<T>>,
  enabled = true,
  pageSize = DEFAULT_PAGE_SIZE,
) {
  const [page, setPage] = useState(0);
  const query = useQuery({
    queryKey: [...baseKey, page, pageSize],
    queryFn: () => fetcher(page, pageSize),
    enabled,
    placeholderData: keepPreviousData,
  });

  const count = query.data?.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(count / pageSize));

  return {
    items: query.data?.rows ?? [],
    count,
    page,
    pageCount,
    pageSize,
    setPage,
    loading: query.isPending && enabled,
    fetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refresh: () => void query.refetch(),
  };
}
