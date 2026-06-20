'use client';

import { redirect, useRouter } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { StaffForm } from '@/components/staff/StaffForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { createStaffMember } from '@/services/staff';
import type { StaffInput } from '@/lib/validations/staff.schema';

export default function NewStaffPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  if (authLoading) return null;
  if (user && user.role !== 'owner') redirect('/dashboard');

  if (!user) return null;

  async function handleSubmit(data: StaffInput, password: string) {
    await createStaffMember(user!.organization_id, data, password);
    toast('Staff member added', 'success');
    router.push('/staff');
    router.refresh();
  }

  return (
    <div>
      <Topbar title="Add Staff Member" subtitle="Invite a property manager or caretaker" role={user.role} />
      <div className="p-6">
        <Card>
          <StaffForm onSubmit={handleSubmit} />
        </Card>
      </div>
    </div>
  );
}
