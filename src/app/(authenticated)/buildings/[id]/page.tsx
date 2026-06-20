import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, DoorOpen } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Card, CardTitle } from '@/components/ui/Card';
import { UnitStatusBadge } from '@/components/units/UnitStatusBadge';
import { getCurrentUser, createClient } from '@/lib/supabase/server';
import { formatKES } from '@/lib/utils/currency';
import type { Building, Unit } from '@/types/database.types';

export default async function BuildingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: building } = await supabase
    .from('buildings')
    .select('*')
    .eq('id', id)
    .eq('organization_id', user!.organization_id)
    .single() as { data: Building | null };

  if (!building) notFound();

  const { data: units } = await supabase
    .from('units')
    .select('*')
    .eq('building_id', id)
    .order('unit_number') as { data: Unit[] | null };

  const occupied = units?.filter((u) => u.status === 'occupied').length || 0;

  return (
    <div>
      <Topbar title={building.name} subtitle={building.address} role={user!.role} />
      <div className="p-6 space-y-6">
        <Link href="/buildings" className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700">
          <ArrowLeft className="h-4 w-4" /> Back to buildings
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-gray-500">Total Units</p>
            <p className="text-2xl font-bold text-gray-900">{building.total_units}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Occupied</p>
            <p className="text-2xl font-bold text-emerald-700">{occupied}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Floors</p>
            <p className="text-2xl font-bold text-gray-900">{building.total_floors}</p>
          </Card>
        </div>

        <Card>
          <CardTitle>Property Details</CardTitle>
          <dl className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><dt className="text-gray-500">Location</dt><dd className="font-medium flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{building.city}, {building.county}</dd></div>
            <div><dt className="text-gray-500">Year Built</dt><dd className="font-medium">{building.year_built || '—'}</dd></div>
            <div><dt className="text-gray-500">Caretaker</dt><dd className="font-medium">{building.caretaker_name || '—'}</dd></div>
            <div><dt className="text-gray-500">Caretaker Phone</dt><dd className="font-medium">{building.caretaker_phone || '—'}</dd></div>
          </dl>
        </Card>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DoorOpen className="h-5 w-5" /> Units
          </h2>
          {units?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {units.map((unit) => (
                <Card key={unit.id} padding="sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{unit.unit_number}</span>
                    <UnitStatusBadge status={unit.status} />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{unit.bedrooms}BR · {formatKES(unit.rent_amount)}/mo</p>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No units in this building yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
