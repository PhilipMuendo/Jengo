'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { mpesaPaymentSchema } from '@/lib/validations/payment.schema';
import { formatKES } from '@/lib/utils/currency';
import { initiateMpesaPayment } from '@/services/payments';
import type { Invoice } from '@/types/database.types';

interface MpesaPaymentFormProps {
  invoice: Invoice;
  onSuccess?: () => void;
}

export function MpesaPaymentForm({ invoice, onSuccess }: MpesaPaymentFormProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = mpesaPaymentSchema.safeParse({
      phone,
      amount: invoice.amount,
      invoice_id: invoice.id,
      unit_id: invoice.unit_id,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await initiateMpesaPayment({
        phone: result.data.phone,
        amount: result.data.amount,
        invoiceId: result.data.invoice_id,
        unitId: result.data.unit_id,
      });
      setMessage(response.responseDescription || 'STK Push sent. Check your phone to complete payment.');
      onSuccess?.();
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'M-Pesa payment failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardTitle>Pay with M-Pesa</CardTitle>
      <CardDescription>Invoice {invoice.invoice_number} · {formatKES(invoice.amount)}</CardDescription>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {errors.form && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{errors.form}</div>}
        {message && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">{message}</div>}
        <Input
          label="M-Pesa Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          placeholder="0712345678"
          required
        />
        <Button type="submit" loading={loading} className="w-full">
          Pay {formatKES(invoice.amount)}
        </Button>
      </form>
    </Card>
  );
}
