'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import { MaintenanceTable } from '@/components/maintenance/MaintenanceTable';
import { useAuth } from '@/lib/hooks/useAuth';
import { useMaintenance } from '@/lib/hooks/useMaintenance';
import { useToast } from '@/lib/hooks/useToast';
import { updateMaintenanceStatus } from '@/services/maintenance';

export default function MaintenancePage() {
  const { user } = useAuth();
  const { requests, loading, refresh } = useMaintenance(user?.organization_id);
  const { toast } = useToast();

  if (!user) return null;

  async function handleStatusChange(id: string, status: Parameters<typeof updateMaintenanceStatus>[1]) {
    try {
      await updateMaintenanceStatus(id, status);
      toast('Status updated', 'success');
      refresh();
    } catch {
      toast('Failed to update status', 'error');
    }
  }

  const canManage = user.role === 'owner' || user.role === 'property_manager' || user.role === 'caretaker';

  return (
    <div>
      <Topbar
        title="Maintenance"
        subtitle={`${requests.length} requests`}
        role={user.role}
        actions={
          <Link href="/maintenance/new">
            <Button size="sm"><Plus className="h-4 w-4" /> New Request</Button>
          </Link>
        }
      />
      <div className="p-6">
        <MaintenanceTable
          requests={requests}
          loading={loading}
          onStatusChange={canManage ? handleStatusChange : undefined}
        />
      </div>
    </div>
  );
}
