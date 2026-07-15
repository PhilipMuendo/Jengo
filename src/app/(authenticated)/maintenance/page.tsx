'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import { MaintenanceTable } from '@/components/maintenance/MaintenanceTable';
import { Pagination } from '@/components/ui/Pagination';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePaginatedQuery } from '@/lib/hooks/usePaginatedQuery';
import { useToast } from '@/lib/hooks/useToast';
import { getMaintenancePage, updateMaintenanceStatus } from '@/services/maintenance';

export default function MaintenancePage() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const { items, loading, fetching, count, page, pageCount, pageSize, setPage, refresh } =
    usePaginatedQuery(
      ['maintenance', orgId],
      (p, s) => getMaintenancePage(orgId!, p, s),
      !!orgId,
    );
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
        subtitle={`${count} requests`}
        role={user.role}
        actions={
          <Link href="/maintenance/new">
            <Button size="sm"><Plus className="h-4 w-4" /> New Request</Button>
          </Link>
        }
      />
      <div className="p-6">
        <MaintenanceTable
          requests={items}
          loading={loading}
          onStatusChange={canManage ? handleStatusChange : undefined}
        />
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
