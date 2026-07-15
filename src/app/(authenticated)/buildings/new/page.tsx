'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { BuildingForm } from '@/components/buildings/BuildingForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { createBuilding } from '@/services/buildings';
import type { BuildingInput } from '@/lib/validations/building.schema';

export default function NewBuildingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  if (!user) return null;

  async function handleSubmit(data: BuildingInput) {
    await createBuilding(user!.organization_id, data);
    toast('Building created successfully', 'success');
    await queryClient.invalidateQueries({ queryKey: ['buildings'] });
    router.push('/buildings');
  }

  return (
    <div>
      <Topbar title="Add Building" subtitle="Register a new property" role={user.role} />
      <div className="p-6">
        <Card>
          <BuildingForm onSubmit={handleSubmit} submitLabel="Create Building" />
        </Card>
      </div>
    </div>
  );
}
