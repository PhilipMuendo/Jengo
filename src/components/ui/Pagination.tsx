'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaginationProps {
  /** 0-indexed current page. */
  page: number;
  pageCount: number;
  count: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  busy?: boolean;
}

export function Pagination({ page, pageCount, count, pageSize, onPageChange, busy }: PaginationProps) {
  if (count === 0) return null;

  const from = page * pageSize + 1;
  const to = Math.min(count, (page + 1) * pageSize);

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm text-gray-600 sm:flex-row">
      <p>
        Showing <span className="font-medium text-gray-900 tabular-nums">{from}</span>–
        <span className="font-medium text-gray-900 tabular-nums">{to}</span> of{' '}
        <span className="font-medium text-gray-900 tabular-nums">{count}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0 || busy}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <span className="tabular-nums text-gray-500">
          Page {page + 1} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount - 1 || busy}
          onClick={() => onPageChange(page + 1)}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
