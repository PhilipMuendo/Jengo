'use client';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import { StaffTable } from '@/components/staff/StaffTable';
import { useAuth } from '@/lib/hooks/useAuth';
import { useStaff } from '@/lib/hooks/useStaff';

export default function StaffPage() {
  const { user, loading: authLoading } = useAuth();
  const { staff, loading } = useStaff(user?.organization_id);

  if (authLoading) return null;
  if (user && user.role !== 'owner') redirect('/dashboard');

  if (!user) return null;

  return (
    <div>
      <Topbar
        title="Staff"
        subtitle="Manage property managers and caretakers"
        role={user.role}
        actions={
          <Link href="/staff/new">
            <Button size="sm"><Plus className="h-4 w-4" /> Add Staff</Button>
          </Link>
        }
      />
      <div className="p-6">
        <StaffTable staff={staff} loading={loading} />
      </div>
    </div>
  );
}
