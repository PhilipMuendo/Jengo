'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import { TenantTable } from '@/components/tenants/TenantTable';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTenants } from '@/lib/hooks/useTenants';

export default function TenantsPage() {
  const { user } = useAuth();
  const { tenants, loading } = useTenants(user?.organization_id);

  if (!user) return null;

  return (
    <div>
      <Topbar
        title="Tenants"
        subtitle={`${tenants.length} registered tenants`}
        role={user.role}
        actions={
          <Link href="/tenants/new">
            <Button size="sm"><Plus className="h-4 w-4" /> Add Tenant</Button>
          </Link>
        }
      />
      <div className="p-6">
        <TenantTable tenants={tenants} loading={loading} />
      </div>
    </div>
  );
}
