'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { paymentSchema, type PaymentInput } from '@/lib/validations/payment.schema';
import type { TenantWithLease } from '@/services/tenants';

interface PaymentFormProps {
  tenants: TenantWithLease[];
  onSubmit: (data: PaymentInput) => Promise<void>;
}

export function PaymentForm({ tenants, onSubmit }: PaymentFormProps) {
  const activeTenants = tenants.filter((t) => t.leases?.some((l) => l.status === 'active'));
  const firstTenant = activeTenants[0];
  const firstLease = firstTenant?.leases?.[0];

  const [form, setForm] = useState<PaymentInput>({
    tenant_id: firstTenant?.id || '',
    unit_id: firstLease?.unit_id || '',
    amount: firstLease?.monthly_rent || 0,
    method: 'cash',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function updateTenant(tenantId: string) {
    const tenant = activeTenants.find((t) => t.id === tenantId);
    const lease = tenant?.leases?.[0];
    setForm((prev) => ({
      ...prev,
      tenant_id: tenantId,
      unit_id: lease?.unit_id || '',
      amount: lease?.monthly_rent || prev.amount,
    }));
  }

  function updateField(field: keyof PaymentInput, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = paymentSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      await onSubmit(result.data);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Failed to record payment' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {errors.form && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{errors.form}</div>}
      <Select
        label="Tenant"
        value={form.tenant_id}
        onChange={(e) => updateTenant(e.target.value)}
        error={errors.tenant_id}
        options={activeTenants.map((t) => ({ value: t.id, label: t.full_name }))}
        placeholder="Select tenant"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Amount (KES)" type="number" min={1} value={form.amount} onChange={(e) => updateField('amount', e.target.value)} error={errors.amount} required />
        <Select
          label="Payment Method"
          value={form.method}
          onChange={(e) => updateField('method', e.target.value)}
          options={[
            { value: 'cash', label: 'Cash' },
            { value: 'mpesa', label: 'M-Pesa' },
            { value: 'bank', label: 'Bank Transfer' },
            { value: 'cheque', label: 'Cheque' },
          ]}
        />
      </div>
      {form.method === 'mpesa' && (
        <Input label="M-Pesa Receipt" value={form.mpesa_receipt || ''} onChange={(e) => updateField('mpesa_receipt', e.target.value)} />
      )}
      {(form.method === 'bank' || form.method === 'cheque') && (
        <Input label="Transaction ID" value={form.transaction_id || ''} onChange={(e) => updateField('transaction_id', e.target.value)} />
      )}
      <Input label="Notes" value={form.notes || ''} onChange={(e) => updateField('notes', e.target.value)} />
      <Button type="submit" loading={loading}>Record Payment</Button>
    </form>
  );
}
