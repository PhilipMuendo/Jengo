'use client';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect, useState } from 'react';
import { getOrganization } from '@/services/auth';
import { SUBSCRIPTION_TIERS } from '@/lib/constants';
import { formatKES } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import type { Organization } from '@/types/database.types';

export default function BillingPage() {
  const { user, loading: authLoading } = useAuth();
  const [org, setOrg] = useState<Organization | null>(null);

  useEffect(() => {
    if (user?.organization_id) {
      getOrganization(user.organization_id).then(setOrg);
    }
  }, [user?.organization_id]);

  if (authLoading) return null;
  if (user && user.role !== 'owner') redirect('/settings');

  if (!user) return null;

  const tier = org ? SUBSCRIPTION_TIERS[org.subscription_tier] : null;

  return (
    <div>
      <Topbar title="Billing" subtitle="Subscription and plan details" role={user.role} />
      <div className="p-6 max-w-2xl space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700">
          <ArrowLeft className="h-4 w-4" /> Back to settings
        </Link>

        {org && tier ? (
          <>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{tier.name} Plan</CardTitle>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">{formatKES(tier.price)}<span className="text-sm font-normal text-gray-500">/month</span></p>
                </div>
                <Badge variant={org.subscription_status === 'active' ? 'green' : 'yellow'}>
                  {org.subscription_status}
                </Badge>
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Max Buildings</dt>
                  <dd className="font-medium">{tier.maxBuildings === -1 ? 'Unlimited' : tier.maxBuildings}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Max Units</dt>
                  <dd className="font-medium">{tier.maxUnits === -1 ? 'Unlimited' : tier.maxUnits}</dd>
                </div>
                {org.subscription_start_date && (
                  <div>
                    <dt className="text-gray-500">Started</dt>
                    <dd className="font-medium">{formatDate(org.subscription_start_date)}</dd>
                  </div>
                )}
                {org.subscription_end_date && (
                  <div>
                    <dt className="text-gray-500">Renews</dt>
                    <dd className="font-medium">{formatDate(org.subscription_end_date)}</dd>
                  </div>
                )}
              </dl>
            </Card>

            <Card>
              <CardTitle>Upgrade Plan</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Contact sales to upgrade your subscription tier.</p>
              <Button className="mt-4" variant="outline">Contact Sales</Button>
            </Card>
          </>
        ) : (
          <Card><p className="text-gray-500">Loading billing information...</p></Card>
        )}
      </div>
    </div>
  );
}
