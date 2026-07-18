import Link from 'next/link';
import { Building2, MapPin, DoorOpen } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Building } from '@/types/database.types';

interface BuildingCardProps {
  building: Building;
  occupiedUnits?: number;
}

export function BuildingCard({ building, occupiedUnits = 0 }: BuildingCardProps) {
  const occupancy = building.total_units
    ? Math.round((occupiedUnits / building.total_units) * 100)
    : 0;

  return (
    <Link href={`/buildings/${building.id}`}>
      <Card className="hover:border-brand-300 hover:shadow-md transition-all cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
            <Building2 className="h-5 w-5 text-brand-700" />
          </div>
          <Badge variant={occupancy >= 80 ? 'green' : occupancy >= 50 ? 'yellow' : 'gray'}>
            {occupancy}% occupied
          </Badge>
        </div>
        <CardTitle>{building.name}</CardTitle>
        <CardDescription className="flex items-center gap-1 mt-2">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {building.address}, {building.city}
        </CardDescription>
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <DoorOpen className="h-4 w-4" />
            {building.total_units} units
          </span>
          <span>{building.total_floors} floors</span>
        </div>
      </Card>
    </Link>
  );
}
