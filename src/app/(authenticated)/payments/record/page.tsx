'use client';

import { useRouter } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTenants } from '@/lib/hooks/useTenants';
import { useToast } from '@/lib/hooks/useToast';
import { recordPayment } from '@/services/payments';
import type { PaymentInput } from '@/lib/validations/payment.schema';

export default function RecordPaymentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { tenants } = useTenants(user?.organization_id);
  const { toast } = useToast();

  if (!user) return null;

  async function handleSubmit(data: PaymentInput) {
    await recordPayment(data, user!.id);
    toast('Payment recorded successfully', 'success');
    router.push('/payments');
    router.refresh();
  }

  return (
    <div>
      <Topbar title="Record Payment" subtitle="Manually log a rent payment" role={user.role} />
      <div className="p-6">
        <Card>
          <PaymentForm tenants={tenants} onSubmit={handleSubmit} />
        </Card>
      </div>
    </div>
  );
}
