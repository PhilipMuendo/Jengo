'use client';

import { MpesaPaymentForm } from '@/components/payments/MpesaPaymentForm';
import { Card, CardTitle } from '@/components/ui/Card';
import type { Invoice } from '@/types/database.types';

interface TenantPaymentProps {
  invoice: Invoice;
}

export function TenantPayment({ invoice }: TenantPaymentProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Pay Rent</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Your next payment is due. Use M-Pesa for instant confirmation.
        </p>
      </Card>
      <MpesaPaymentForm invoice={invoice} />
    </div>
  );
}
