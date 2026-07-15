'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { MaintenanceForm } from '@/components/maintenance/MaintenanceForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUnits } from '@/lib/hooks/useUnits';
import { useToast } from '@/lib/hooks/useToast';
import { createMaintenanceRequest } from '@/services/maintenance';
import type { MaintenanceInput } from '@/lib/validations/maintenance.schema';

export default function NewMaintenancePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { units } = useUnits(user?.organization_id);
  const { toast } = useToast();

  if (!user) return null;

  async function handleSubmit(data: MaintenanceInput) {
    await createMaintenanceRequest(data, {
      tenantId: user!.role === 'tenant' ? user!.id : undefined,
      reportedBy: user!.id,
    });
    toast('Maintenance request submitted', 'success');
    await queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    router.push(user!.role === 'tenant' ? '/tenant/portal' : '/maintenance');
  }

  return (
    <div>
      <Topbar title="New Maintenance Request" subtitle="Report an issue" role={user.role} />
      <div className="p-6">
        <Card>
          <MaintenanceForm units={units} onSubmit={handleSubmit} />
        </Card>
      </div>
    </div>
  );
}
