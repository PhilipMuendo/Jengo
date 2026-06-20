'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { tenantSchema, type TenantInput } from '@/lib/validations/tenant.schema';
import type { UnitWithBuilding } from '@/services/units';

interface TenantFormProps {
  units: UnitWithBuilding[];
  onSubmit: (data: TenantInput, password: string) => Promise<void>;
}

export function TenantForm({ units, onSubmit }: TenantFormProps) {
  const vacantUnits = units.filter((u) => u.status === 'vacant');
  const [password, setPassword] = useState('');
  const [form, setForm] = useState<TenantInput>({
    full_name: '',
    email: '',
    phone: '',
    unit_id: vacantUnits[0]?.id || '',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
    monthly_rent: vacantUnits[0]?.rent_amount || 0,
    deposit_amount: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof TenantInput, value: string | number) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'unit_id') {
        const unit = vacantUnits.find((u) => u.id === value);
        if (unit) next.monthly_rent = unit.rent_amount;
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = tenantSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    if (password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      return;
    }
    setLoading(true);
    try {
      await onSubmit(result.data, password);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Failed to register tenant' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {errors.form && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{errors.form}</div>}
      <Input label="Full Name" value={form.full_name} onChange={(e) => updateField('full_name', e.target.value)} error={errors.full_name} required />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} error={errors.email} required />
        <Input label="Phone" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} error={errors.phone} placeholder="0712345678" required />
      </div>
      <Input label="ID Number" value={form.id_number || ''} onChange={(e) => updateField('id_number', e.target.value)} error={errors.id_number} />
      <Input label="Temporary Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} hint="Tenant will use this to log in" required />
      <Select
        label="Assign Unit"
        value={form.unit_id}
        onChange={(e) => updateField('unit_id', e.target.value)}
        error={errors.unit_id}
        options={vacantUnits.map((u) => ({ value: u.id, label: `${u.unit_number} · ${u.buildings?.name || ''}` }))}
        placeholder="Select vacant unit"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Lease Start" type="date" value={form.start_date} onChange={(e) => updateField('start_date', e.target.value)} error={errors.start_date} />
        <Input label="Lease End" type="date" value={form.end_date} onChange={(e) => updateField('end_date', e.target.value)} error={errors.end_date} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Monthly Rent (KES)" type="number" value={form.monthly_rent} onChange={(e) => updateField('monthly_rent', e.target.value)} error={errors.monthly_rent} />
        <Input label="Deposit (KES)" type="number" value={form.deposit_amount} onChange={(e) => updateField('deposit_amount', e.target.value)} />
      </div>
      <Button type="submit" loading={loading}>Register Tenant</Button>
    </form>
  );
}
