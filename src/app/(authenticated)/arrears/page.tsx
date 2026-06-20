import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getCurrentUser, createClient } from '@/lib/supabase/server';
import { formatKES } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import type { Invoice } from '@/types/database.types';

type ArrearsInvoice = Invoice & {
  users?: { full_name: string; phone: string } | null;
  units?: { unit_number: string } | null;
};

export default async function ArrearsPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, users!invoices_tenant_id_fkey(full_name, phone), units(unit_number, buildings!inner(name, organization_id))')
    .eq('units.buildings.organization_id', user!.organization_id)
    .eq('status', 'overdue')
    .order('due_date') as { data: ArrearsInvoice[] | null };

  const totalArrears = invoices?.reduce((sum, i) => sum + Number(i.amount), 0) || 0;

  return (
    <div>
      <Topbar
        title="Arrears"
        subtitle={`${invoices?.length || 0} overdue invoices · ${formatKES(totalArrears)} total`}
        role={user!.role}
      />
      <div className="p-6 space-y-6">
        <Card className="bg-red-50 border-red-200">
          <p className="text-sm text-red-700">Total Outstanding Arrears</p>
          <p className="text-3xl font-bold text-red-800">{formatKES(totalArrears)}</p>
        </Card>

        <Card padding="none" className="overflow-hidden">
          {invoices?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Tenant</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Unit</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Invoice</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Amount</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Due Date</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Days Overdue</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map((inv) => {
                    const daysOverdue = Math.floor(
                      (Date.now() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{inv.users?.full_name}</div>
                          <div className="text-xs text-gray-400">{inv.users?.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{inv.units?.unit_number}</td>
                        <td className="px-6 py-4 text-gray-600">{inv.invoice_number}</td>
                        <td className="px-6 py-4 font-medium text-red-700">{formatKES(inv.amount)}</td>
                        <td className="px-6 py-4 text-gray-600">{formatDate(inv.due_date)}</td>
                        <td className="px-6 py-4">
                          <Badge variant="red">{daysOverdue} days</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No overdue invoices — great job!</p>
          )}
        </Card>
      </div>
    </div>
  );
}
