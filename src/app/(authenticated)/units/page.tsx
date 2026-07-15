'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import { UnitTable } from '@/components/units/UnitTable';
import { Pagination } from '@/components/ui/Pagination';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePaginatedQuery } from '@/lib/hooks/usePaginatedQuery';
import { getUnitsPage } from '@/services/units';

export default function UnitsPage() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const { items, loading, fetching, count, page, pageCount, pageSize, setPage } = usePaginatedQuery(
    ['units', orgId],
    (p, s) => getUnitsPage(orgId!, p, s),
    !!orgId,
  );

  if (!user) return null;

  return (
    <div>
      <Topbar
        title="Units"
        subtitle={`${count} total units`}
        role={user.role}
        actions={
          <Link href="/units/new">
            <Button size="sm"><Plus className="h-4 w-4" /> Add Unit</Button>
          </Link>
        }
      />
      <div className="p-6">
        <UnitTable units={items} loading={loading} />
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
