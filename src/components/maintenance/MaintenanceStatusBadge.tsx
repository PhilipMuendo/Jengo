import { Badge } from '@/components/ui/Badge';
import { MAINTENANCE_STATUSES } from '@/lib/constants/statuses';
import type { MaintenanceStatus } from '@/types/database.types';

interface MaintenanceStatusBadgeProps {
  status: MaintenanceStatus;
}

export function MaintenanceStatusBadge({ status }: MaintenanceStatusBadgeProps) {
  const config = MAINTENANCE_STATUSES[status];
  return <Badge variant={config.color as 'gray' | 'green' | 'yellow' | 'blue' | 'purple'}>{config.label}</Badge>;
}
