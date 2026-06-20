'use client';

import { useRouter } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { UnitForm } from '@/components/units/UnitForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { useBuildings } from '@/lib/hooks/useBuildings';
import { useToast } from '@/lib/hooks/useToast';
import { createUnit } from '@/services/units';
import type { UnitInput } from '@/lib/validations/unit.schema';

export default function NewUnitPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { buildings } = useBuildings(user?.organization_id);
  const { toast } = useToast();

  if (!user) return null;

  async function handleSubmit(data: UnitInput) {
    await createUnit(data);
    toast('Unit created successfully', 'success');
    router.push('/units');
    router.refresh();
  }

  return (
    <div>
      <Topbar title="Add Unit" subtitle="Register a new rental unit" role={user.role} />
      <div className="p-6">
        <Card>
          <UnitForm buildings={buildings} onSubmit={handleSubmit} />
        </Card>
      </div>
    </div>
  );
}
