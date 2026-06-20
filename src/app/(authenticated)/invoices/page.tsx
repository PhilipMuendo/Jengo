import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getCurrentUser, createClient } from '@/lib/supabase/server';
import { INVOICE_STATUSES } from '@/lib/constants/statuses';
import { formatKES } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import type { Invoice } from '@/types/database.types';

type InvoiceRow = Invoice & {
  users?: { full_name: string } | null;
  units?: { unit_number: string } | null;
};

export default async function InvoicesPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, users!invoices_tenant_id_fkey(full_name), units(unit_number, buildings!inner(name, organization_id))')
    .eq('units.buildings.organization_id', user!.organization_id)
    .order('due_date', { ascending: false }) as { data: InvoiceRow[] | null };

  return (
    <div>
      <Topbar title="Invoices" subtitle={`${invoices?.length || 0} invoices`} role={user!.role} />
      <div className="p-6">
        <Card padding="none" className="overflow-hidden">
          {invoices?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Invoice #</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Tenant</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Unit</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Amount</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Due Date</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map((inv) => {
                    const status = INVOICE_STATUSES[inv.status];
                    return (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{inv.invoice_number}</td>
                        <td className="px-6 py-4 text-gray-600">{inv.users?.full_name || '—'}</td>
                        <td className="px-6 py-4 text-gray-600">{inv.units?.unit_number || '—'}</td>
                        <td className="px-6 py-4 font-medium">{formatKES(inv.amount)}</td>
                        <td className="px-6 py-4 text-gray-600">{formatDate(inv.due_date)}</td>
                        <td className="px-6 py-4">
                          <Badge variant={status.color as 'green' | 'yellow' | 'red' | 'gray'}>{status.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No invoices generated yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
