import { Badge } from '@/components/ui/Badge';
import { UNIT_STATUSES } from '@/lib/constants/statuses';
import type { UnitStatus } from '@/types/database.types';

interface UnitStatusBadgeProps {
  status: UnitStatus;
}

export function UnitStatusBadge({ status }: UnitStatusBadgeProps) {
  const config = UNIT_STATUSES[status];
  return <Badge variant={config.color as 'gray' | 'green' | 'yellow' | 'blue'}>{config.label}</Badge>;
}
