import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import { BuildingCard } from '@/components/buildings/BuildingCard';
import { getCurrentUser, createClient } from '@/lib/supabase/server';
import type { Building, Unit } from '@/types/database.types';

export default async function BuildingsPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: buildings } = await supabase
    .from('buildings')
    .select('*')
    .eq('organization_id', user!.organization_id)
    .order('name') as { data: Building[] | null };

  const buildingIds = buildings?.map((b) => b.id) || [];
  let occupancyMap: Record<string, number> = {};

  if (buildingIds.length) {
    const { data: units } = await supabase
      .from('units')
      .select('building_id, status')
      .in('building_id', buildingIds)
      .eq('status', 'occupied') as { data: Pick<Unit, 'building_id' | 'status'>[] | null };

    occupancyMap = (units || []).reduce<Record<string, number>>((acc, u) => {
      acc[u.building_id] = (acc[u.building_id] || 0) + 1;
      return acc;
    }, {});
  }

  return (
    <div>
      <Topbar
        title="Buildings"
        subtitle={`${buildings?.length || 0} properties`}
        role={user!.role}
        actions={
          <Link href="/buildings/new">
            <Button size="sm"><Plus className="h-4 w-4" /> Add Building</Button>
          </Link>
        }
      />
      <div className="p-6">
        {buildings?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buildings.map((building) => (
              <BuildingCard
                key={building.id}
                building={building}
                occupiedUnits={occupancyMap[building.id] || 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p>No buildings yet. Add your first property to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
