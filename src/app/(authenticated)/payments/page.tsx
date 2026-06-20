'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import { PaymentTable } from '@/components/payments/PaymentTable';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePayments } from '@/lib/hooks/usePayments';

export default function PaymentsPage() {
  const { user } = useAuth();
  const { payments, loading } = usePayments(user?.organization_id);

  if (!user) return null;

  return (
    <div>
      <Topbar
        title="Payments"
        subtitle="Payment history and records"
        role={user.role}
        actions={
          <Link href="/payments/record">
            <Button size="sm"><Plus className="h-4 w-4" /> Record Payment</Button>
          </Link>
        }
      />
      <div className="p-6">
        <PaymentTable payments={payments} loading={loading} />
      </div>
    </div>
  );
}
