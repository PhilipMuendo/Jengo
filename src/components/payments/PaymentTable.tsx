'use client';

import { CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { PAYMENT_STATUSES } from '@/lib/constants/statuses';
import { formatKES } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import type { PaymentWithRelations } from '@/services/payments';

interface PaymentTableProps {
  payments: PaymentWithRelations[];
  loading?: boolean;
}

export function PaymentTable({ payments, loading }: PaymentTableProps) {
  if (loading) {
    return (
      <Card padding="none">
        <div className="space-y-3 p-6">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </Card>
    );
  }

  if (!payments.length) {
    return (
      <Card padding="none">
        <EmptyState
          icon={CreditCard}
          title="No payments yet"
          description="Payments appear here once tenants pay via M-Pesa or you record one manually."
        />
      </Card>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <Table>
        <THead>
          <TH>Date</TH>
          <TH>Tenant</TH>
          <TH>Unit</TH>
          <TH>Amount</TH>
          <TH>Method</TH>
          <TH>Status</TH>
        </THead>
        <TBody>
          {payments.map((payment) => {
            const status = PAYMENT_STATUSES[payment.status];
            return (
              <TR key={payment.id}>
                <TD>{formatDate(payment.payment_date)}</TD>
                <TD className="font-medium text-gray-900">{payment.users?.full_name || '—'}</TD>
                <TD>{payment.units?.unit_number || '—'}</TD>
                <TD className="font-medium tabular-nums text-gray-900">{formatKES(payment.amount)}</TD>
                <TD className="capitalize">{payment.method}</TD>
                <TD>
                  <Badge variant={status.color as 'green' | 'yellow' | 'red' | 'gray' | 'orange'}>{status.label}</Badge>
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>
    </Card>
  );
}
