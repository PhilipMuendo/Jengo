import { redirect } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { TenantDashboard } from '@/components/tenant/TenantDashboard';
import { getCurrentUser, createClient } from '@/lib/supabase/server';
import type { Invoice, Payment, MaintenanceRequest, Lease, Unit, Building } from '@/types/database.types';

type ActiveLease = Lease & {
  units?: (Unit & { buildings?: Pick<Building, 'name'> | null }) | null;
};

export default async function TenantPortalPage() {
  const user = await getCurrentUser();

  if (user?.role !== 'tenant') redirect('/dashboard');

  const supabase = await createClient();

  const { data: lease } = await supabase
    .from('leases')
    .select('*, units(unit_number, buildings(name))')
    .eq('tenant_id', user!.id)
    .eq('status', 'active')
    .single() as { data: ActiveLease | null };

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('tenant_id', user!.id)
    .order('due_date', { ascending: false }) as { data: Invoice[] | null };

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('tenant_id', user!.id)
    .order('payment_date', { ascending: false }) as { data: Payment[] | null };

  const { data: maintenanceRequests } = await supabase
    .from('maintenance_requests')
    .select('*')
    .eq('tenant_id', user!.id)
    .order('created_at', { ascending: false }) as { data: MaintenanceRequest[] | null };

  return (
    <div>
      <Topbar title="My Portal" subtitle="Your tenancy overview" role={user!.role} />
      <div className="p-6">
        <TenantDashboard
          tenantName={user!.full_name}
          lease={lease || undefined}
          invoices={invoices || []}
          payments={payments || []}
          maintenanceRequests={maintenanceRequests || []}
        />
      </div>
    </div>
  );
}
