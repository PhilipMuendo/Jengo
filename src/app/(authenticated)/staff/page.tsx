'use client';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import { StaffTable } from '@/components/staff/StaffTable';
import { Pagination } from '@/components/ui/Pagination';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePaginatedQuery } from '@/lib/hooks/usePaginatedQuery';
import { getStaffPage } from '@/services/staff';

export default function StaffPage() {
  const { user, loading: authLoading } = useAuth();
  const orgId = user?.organization_id;
  const { items, loading, fetching, count, page, pageCount, pageSize, setPage } = usePaginatedQuery(
    ['staff', orgId],
    (p, s) => getStaffPage(orgId!, p, s),
    !!orgId,
  );

  if (authLoading) return null;
  if (user && user.role !== 'owner') redirect('/dashboard');

  if (!user) return null;

  return (
    <div>
      <Topbar
        title="Staff"
        subtitle="Manage property managers and caretakers"
        role={user.role}
        actions={
          <Link href="/staff/new">
            <Button size="sm"><Plus className="h-4 w-4" /> Add Staff</Button>
          </Link>
        }
      />
      <div className="p-6">
        <StaffTable staff={items} loading={loading} />
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
