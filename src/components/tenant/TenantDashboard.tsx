'use client';

import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TenantPayment } from './TenantPayment';
import { TenantMaintenance } from './TenantMaintenance';
import { formatKES } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import { INVOICE_STATUSES } from '@/lib/constants/statuses';
import type { Invoice, Lease, Payment, MaintenanceRequest } from '@/types/database.types';

interface TenantDashboardProps {
  tenantName: string;
  lease?: Lease & { units?: { unit_number: string; buildings?: { name: string } | null } | null };
  invoices: Invoice[];
  payments: Payment[];
  maintenanceRequests: MaintenanceRequest[];
}

export function TenantDashboard({
  tenantName,
  lease,
  invoices,
  payments,
  maintenanceRequests,
}: TenantDashboardProps) {
  const pendingInvoice = invoices.find((i) => i.status === 'pending' || i.status === 'overdue');
  const recentPayments = payments.slice(0, 5);
  const openRequests = maintenanceRequests.filter((r) => !['resolved', 'cancelled'].includes(r.status));

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>Welcome, {tenantName}</CardTitle>
        <CardDescription>
          {lease
            ? `Unit ${lease.units?.unit_number} · ${lease.units?.buildings?.name || ''}`
            : 'No active lease'}
        </CardDescription>
        {lease && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Monthly Rent</p>
              <p className="font-semibold text-gray-900">{formatKES(lease.monthly_rent)}</p>
            </div>
            <div>
              <p className="text-gray-500">Lease Start</p>
              <p className="font-semibold text-gray-900">{formatDate(lease.start_date)}</p>
            </div>
            <div>
              <p className="text-gray-500">Lease End</p>
              <p className="font-semibold text-gray-900">{formatDate(lease.end_date)}</p>
            </div>
            <div>
              <p className="text-gray-500">Open Requests</p>
              <p className="font-semibold text-gray-900">{openRequests.length}</p>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pendingInvoice ? (
          <TenantPayment invoice={pendingInvoice} />
        ) : (
          <Card>
            <CardTitle>Payments</CardTitle>
            <CardDescription>No outstanding invoices</CardDescription>
          </Card>
        )}

        <Card>
          <CardTitle>Recent Payments</CardTitle>
          {recentPayments.length ? (
            <ul className="mt-4 space-y-2">
              {recentPayments.map((p) => (
                <li key={p.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{formatDate(p.payment_date)}</span>
                  <span className="font-medium text-brand-700">{formatKES(p.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 mt-4">No payments yet</p>
          )}
        </Card>
      </div>

      <Card>
        <CardTitle>Outstanding Invoices</CardTitle>
        {invoices.filter((i) => i.status !== 'paid').length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="pb-2">Invoice</th>
                  <th className="pb-2">Due</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.filter((i) => i.status !== 'paid').map((inv) => {
                  const status = INVOICE_STATUSES[inv.status];
                  return (
                    <tr key={inv.id}>
                      <td className="py-2 font-medium">{inv.invoice_number}</td>
                      <td className="py-2 text-gray-600">{formatDate(inv.due_date)}</td>
                      <td className="py-2">{formatKES(inv.amount)}</td>
                      <td className="py-2"><Badge variant={status.color as 'green' | 'yellow' | 'red' | 'gray'}>{status.label}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-4">All invoices paid</p>
        )}
      </Card>

      <TenantMaintenance requests={maintenanceRequests} />
    </div>
  );
}
