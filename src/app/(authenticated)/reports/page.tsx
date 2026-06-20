'use client';

import { useEffect, useState } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { Card, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/hooks/useAuth';
import { getReportSummary, type ReportSummary } from '@/services/reports';
import { formatKES } from '@/lib/utils/currency';

export default function ReportsPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.organization_id) return;
    getReportSummary(user.organization_id)
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [user?.organization_id]);

  if (!user) return null;

  const metrics = summary
    ? [
        { label: 'Buildings', value: summary.totalBuildings },
        { label: 'Total Units', value: summary.totalUnits },
        { label: 'Occupancy Rate', value: `${summary.occupancyRate}%` },
        { label: 'Active Tenants', value: summary.totalTenants },
        { label: 'Monthly Revenue', value: formatKES(summary.monthlyRevenue) },
        { label: 'Overdue Amount', value: formatKES(summary.overdueAmount) },
        { label: 'Open Maintenance', value: summary.openMaintenance },
        { label: 'Vacant Units', value: summary.vacantUnits },
      ]
    : [];

  return (
    <div>
      <Topbar title="Reports" subtitle="Portfolio performance summary" role={user.role} />
      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m) => (
              <Card key={m.label}>
                <CardTitle className="text-sm font-normal text-gray-500">{m.label}</CardTitle>
                <p className="text-2xl font-bold text-gray-900 mt-1">{m.value}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
