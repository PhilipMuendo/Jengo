'use client';

import { useRouter } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { TenantForm } from '@/components/tenants/TenantForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUnits } from '@/lib/hooks/useUnits';
import { useToast } from '@/lib/hooks/useToast';
import { createTenant } from '@/services/tenants';
import type { TenantInput } from '@/lib/validations/tenant.schema';

export default function NewTenantPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { units } = useUnits(user?.organization_id);
  const { toast } = useToast();

  if (!user) return null;

  async function handleSubmit(data: TenantInput, password: string) {
    await createTenant(user!.organization_id, data, password);
    toast('Tenant registered successfully', 'success');
    router.push('/tenants');
    router.refresh();
  }

  return (
    <div>
      <Topbar title="Register Tenant" subtitle="Add a new tenant and assign a unit" role={user.role} />
      <div className="p-6">
        <Card>
          <TenantForm units={units} onSubmit={handleSubmit} />
        </Card>
      </div>
    </div>
  );
}
