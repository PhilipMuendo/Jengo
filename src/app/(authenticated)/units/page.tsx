'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import { UnitTable } from '@/components/units/UnitTable';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUnits } from '@/lib/hooks/useUnits';

export default function UnitsPage() {
  const { user } = useAuth();
  const { units, loading } = useUnits(user?.organization_id);

  if (!user) return null;

  return (
    <div>
      <Topbar
        title="Units"
        subtitle={`${units.length} total units`}
        role={user.role}
        actions={
          <Link href="/units/new">
            <Button size="sm"><Plus className="h-4 w-4" /> Add Unit</Button>
          </Link>
        }
      />
      <div className="p-6">
        <UnitTable units={units} loading={loading} />
      </div>
    </div>
  );
}
