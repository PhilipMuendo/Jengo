'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { getOrganization, updateOrganization } from '@/services/auth';
import { KENYAN_COUNTIES } from '@/lib/constants';
import type { Organization } from '@/types/database.types';

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.organization_id) {
      getOrganization(user.organization_id).then(setOrg);
    }
  }, [user?.organization_id]);

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!org) return;
    setLoading(true);
    try {
      await updateOrganization(org.id, {
        name: org.name,
        email: org.email,
        phone: org.phone,
        address: org.address,
        city: org.city,
        county: org.county,
        mpesa_shortcode: org.mpesa_shortcode,
        mpesa_till_number: org.mpesa_till_number,
      });
      toast('Settings saved', 'success');
    } catch {
      toast('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: keyof Organization, value: string) {
    setOrg((prev) => prev ? { ...prev, [field]: value } : prev);
  }

  return (
    <div>
      <Topbar title="Settings" subtitle="Organization preferences" role={user.role} />
      <div className="p-6 max-w-2xl space-y-6">
        <Card>
          {org ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Organization Name" value={org.name} onChange={(e) => updateField('name', e.target.value)} required />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Email" type="email" value={org.email || ''} onChange={(e) => updateField('email', e.target.value)} />
                <Input label="Phone" value={org.phone || ''} onChange={(e) => updateField('phone', e.target.value)} />
              </div>
              <Input label="Address" value={org.address || ''} onChange={(e) => updateField('address', e.target.value)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="City" value={org.city || ''} onChange={(e) => updateField('city', e.target.value)} />
                <Select
                  label="County"
                  value={org.county || ''}
                  onChange={(e) => updateField('county', e.target.value)}
                  options={KENYAN_COUNTIES.map((c) => ({ value: c, label: c }))}
                />
              </div>
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">M-Pesa Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Paybill Shortcode" value={org.mpesa_shortcode || ''} onChange={(e) => updateField('mpesa_shortcode', e.target.value)} />
                  <Input label="Till Number" value={org.mpesa_till_number || ''} onChange={(e) => updateField('mpesa_till_number', e.target.value)} />
                </div>
              </div>
              <Button type="submit" loading={loading}>Save Changes</Button>
            </form>
          ) : (
            <p className="text-gray-500">Loading settings...</p>
          )}
        </Card>

        {user.role === 'owner' && (
          <Card>
            <h3 className="font-semibold text-gray-900">Billing</h3>
            <p className="text-sm text-gray-500 mt-1">Manage your Jengo subscription</p>
            <Link href="/settings/billing" className="inline-block mt-4 text-brand-600 hover:text-brand-700 text-sm font-medium">
              View billing →
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
