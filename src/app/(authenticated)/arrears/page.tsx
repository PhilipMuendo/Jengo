'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePaginatedQuery } from '@/lib/hooks/usePaginatedQuery';
import { useSupabaseQuery } from '@/lib/hooks/useSupabaseQuery';
import { getOverdueInvoicesPage, getArrearsSummary } from '@/services/invoices';
import { formatKES } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';

export default function ArrearsPage() {
  // Snapshot once per mount; fine for day-granularity overdue math.
  const [now] = useState(() => Date.now());
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const { items, loading, fetching, count, page, pageCount, pageSize, setPage } = usePaginatedQuery(
    ['arrears', orgId],
    (p, s) => getOverdueInvoicesPage(orgId!, p, s),
    !!orgId,
  );
  const { data: summary } = useSupabaseQuery(
    ['arrears-summary', orgId],
    () => getArrearsSummary(orgId!),
    !!orgId,
  );

  if (!user) return null;

  return (
    <div>
      <Topbar title="Arrears" subtitle={`${count} overdue invoices`} role={user.role} />
      <div className="space-y-6 p-6">
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-700">Total Outstanding Arrears</p>
              <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-red-800">
                {formatKES(summary?.overdueAmount ?? 0)}
              </p>
              <p className="mt-1 text-xs text-red-600">
                {summary?.overdueTenants ?? 0} tenants in arrears
              </p>
            </div>
          </div>
        </Card>

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
                <TH>Tenant</TH>
                <TH>Unit</TH>
                <TH>Invoice</TH>
                <TH>Amount</TH>
                <TH>Due Date</TH>
                <TH>Days Overdue</TH>
              </THead>
              <TBody>
                {items.map((inv) => {
                  const daysOverdue = Math.max(
                    0,
                    Math.floor((now - new Date(inv.due_date).getTime()) / 86_400_000),
                  );
                  return (
                    <TR key={inv.id}>
                      <TD>
                        <div className="font-medium text-gray-900">{inv.users?.full_name}</div>
                        <div className="text-xs text-gray-400">{inv.users?.phone}</div>
                      </TD>
                      <TD>{inv.units?.unit_number}</TD>
                      <TD>{inv.invoice_number}</TD>
                      <TD className="font-medium tabular-nums text-red-700">{formatKES(inv.amount)}</TD>
                      <TD>{formatDate(inv.due_date)}</TD>
                      <TD>
                        <Badge variant="red">{daysOverdue} days</Badge>
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
              icon={AlertTriangle}
              title="No overdue invoices"
              description="Every tenant is up to date on rent. Nice work."
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
