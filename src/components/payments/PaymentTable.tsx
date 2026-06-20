'use client';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
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
        <div className="p-6 space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </Card>
    );
  }

  if (!payments.length) {
    return <Card><p className="text-gray-500 text-center py-8">No payments recorded yet.</p></Card>;
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Tenant</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Unit</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Amount</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Method</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {payments.map((payment) => {
              const status = PAYMENT_STATUSES[payment.status];
              return (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-600">{formatDate(payment.payment_date)}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{payment.users?.full_name || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{payment.units?.unit_number || '—'}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{formatKES(payment.amount)}</td>
                  <td className="px-6 py-4 text-gray-600 capitalize">{payment.method}</td>
                  <td className="px-6 py-4">
                    <Badge variant={status.color as 'green' | 'yellow' | 'red' | 'gray' | 'orange'}>{status.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
