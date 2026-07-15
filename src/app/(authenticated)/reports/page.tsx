'use client';

import { useEffect, useState } from 'react';
import { Building2, DoorOpen, Percent, Users, Wallet, AlertTriangle, Wrench, DoorClosed, type LucideIcon } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/format';
import { useAuth } from '@/lib/hooks/useAuth';
import { getReportSummary, type ReportSummary } from '@/services/reports';
import { formatKES } from '@/lib/utils/currency';

export default function ReportsPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.organization_id) return;
    let cancelled = false;
    getReportSummary(user.organization_id).then((result) => {
      if (cancelled) return;
      setSummary(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.organization_id]);

  if (!user) return null;

  type Metric = { label: string; value: string | number; icon: LucideIcon; accent?: 'danger' };
  const metrics: Metric[] = summary
    ? [
        { label: 'Buildings', value: summary.totalBuildings, icon: Building2 },
        { label: 'Total Units', value: summary.totalUnits, icon: DoorOpen },
        { label: 'Occupancy Rate', value: `${summary.occupancyRate}%`, icon: Percent },
        { label: 'Active Tenants', value: summary.totalTenants, icon: Users },
        { label: 'Monthly Revenue', value: formatKES(summary.monthlyRevenue), icon: Wallet },
        { label: 'Overdue Amount', value: formatKES(summary.overdueAmount), icon: AlertTriangle, accent: 'danger' },
        { label: 'Open Maintenance', value: summary.openMaintenance, icon: Wrench },
        { label: 'Vacant Units', value: summary.vacantUnits, icon: DoorClosed },
      ]
    : [];

  return (
    <div>
      <Topbar title="Reports" subtitle="Portfolio performance summary" role={user.role} />
      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? [...Array(8)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
            : metrics.map((m, i) => {
                const Icon = m.icon;
                const isDanger = m.accent === 'danger';
                return (
                  <Card
                    key={m.label}
                    interactive
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{m.label}</p>
                        <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900 tabular-nums">{m.value}</p>
                      </div>
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                          isDanger ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                  </Card>
                );
              })}
        </div>
      </div>
    </div>
  );
}
