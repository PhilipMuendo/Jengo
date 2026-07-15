'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import { TenantTable } from '@/components/tenants/TenantTable';
import { Pagination } from '@/components/ui/Pagination';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePaginatedQuery } from '@/lib/hooks/usePaginatedQuery';
import { getTenantsPage } from '@/services/tenants';

export default function TenantsPage() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const { items, loading, fetching, count, page, pageCount, pageSize, setPage } = usePaginatedQuery(
    ['tenants', orgId],
    (p, s) => getTenantsPage(orgId!, p, s),
    !!orgId,
  );

  if (!user) return null;

  return (
    <div>
      <Topbar
        title="Tenants"
        subtitle={`${count} registered tenants`}
        role={user.role}
        actions={
          <Link href="/tenants/new">
            <Button size="sm"><Plus className="h-4 w-4" /> Add Tenant</Button>
          </Link>
        }
      />
      <div className="p-6">
        <TenantTable tenants={items} loading={loading} />
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
