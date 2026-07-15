'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import { PaymentTable } from '@/components/payments/PaymentTable';
import { Pagination } from '@/components/ui/Pagination';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePaginatedQuery } from '@/lib/hooks/usePaginatedQuery';
import { getPaymentsPage } from '@/services/payments';

export default function PaymentsPage() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const { items, loading, fetching, count, page, pageCount, pageSize, setPage } = usePaginatedQuery(
    ['payments', orgId],
    (p, s) => getPaymentsPage(orgId!, p, s),
    !!orgId,
  );

  if (!user) return null;

  return (
    <div>
      <Topbar
        title="Payments"
        subtitle="Payment history and records"
        role={user.role}
        actions={
          <Link href="/payments/record">
            <Button size="sm"><Plus className="h-4 w-4" /> Record Payment</Button>
          </Link>
        }
      />
      <div className="p-6">
        <PaymentTable payments={items} loading={loading} />
        <Pagination
          page={page}
          pageCount={pageCount}
          count={count}
          pageSize={pageSize}
          onPageChange={setPage}
          busy={fetching}
        />
      </div>
    </div>
  );
}
