'use client';

import { FileText } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePaginatedQuery } from '@/lib/hooks/usePaginatedQuery';
import { getInvoicesPage } from '@/services/invoices';
import { INVOICE_STATUSES } from '@/lib/constants/statuses';
import { formatKES } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';

export default function InvoicesPage() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const { items, loading, fetching, count, page, pageCount, pageSize, setPage } = usePaginatedQuery(
    ['invoices', orgId],
    (p, s) => getInvoicesPage(orgId!, p, s),
    !!orgId,
  );

  if (!user) return null;

  return (
    <div>
      <Topbar title="Invoices" subtitle={`${count} invoices`} role={user.role} />
      <div className="p-6">
        {loading ? (
          <Card padding="none">
            <div className="space-y-3 p-6">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          </Card>
        ) : items.length ? (
          <Card padding="none" className="overflow-hidden">
            <Table>
              <THead>
                <TH>Invoice #</TH>
                <TH>Tenant</TH>
                <TH>Unit</TH>
                <TH>Amount</TH>
                <TH>Due Date</TH>
                <TH>Status</TH>
              </THead>
              <TBody>
                {items.map((inv) => {
                  const status = INVOICE_STATUSES[inv.status];
                  return (
                    <TR key={inv.id}>
                      <TD className="font-medium text-gray-900">{inv.invoice_number}</TD>
                      <TD>{inv.users?.full_name || '—'}</TD>
                      <TD>{inv.units?.unit_number || '—'}</TD>
                      <TD className="font-medium tabular-nums text-gray-900">{formatKES(inv.amount)}</TD>
                      <TD>{formatDate(inv.due_date)}</TD>
                      <TD>
                        <Badge variant={status.color as 'green' | 'yellow' | 'red' | 'gray'}>{status.label}</Badge>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </Card>
        ) : (
          <Card padding="none">
            <EmptyState
              icon={FileText}
              title="No invoices yet"
              description="Invoices are generated automatically each month for active leases."
            />
          </Card>
        )}
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
