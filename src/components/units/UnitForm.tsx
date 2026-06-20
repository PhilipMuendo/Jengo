'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { unitSchema, type UnitInput } from '@/lib/validations/unit.schema';
import { UNIT_STATUSES } from '@/lib/constants/statuses';
import type { Building } from '@/types/database.types';

interface UnitFormProps {
  buildings: Building[];
  onSubmit: (data: UnitInput) => Promise<void>;
}

export function UnitForm({ buildings, onSubmit }: UnitFormProps) {
  const [form, setForm] = useState<UnitInput>({
    building_id: buildings[0]?.id || '',
    unit_number: '',
    bedrooms: 1,
    bathrooms: 1,
    rent_amount: 0,
    status: 'vacant',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof UnitInput, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = unitSchema.safeParse(form);
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
      setErrors({ form: err instanceof Error ? err.message : 'Failed to create unit' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {errors.form && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{errors.form}</div>}
      <Select
        label="Building"
        value={form.building_id}
        onChange={(e) => updateField('building_id', e.target.value)}
        error={errors.building_id}
        options={buildings.map((b) => ({ value: b.id, label: b.name }))}
        placeholder="Select building"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Unit Number" value={form.unit_number} onChange={(e) => updateField('unit_number', e.target.value)} error={errors.unit_number} required />
        <Input label="Unit Label" value={form.unit_label || ''} onChange={(e) => updateField('unit_label', e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Bedrooms" type="number" min={0} value={form.bedrooms} onChange={(e) => updateField('bedrooms', e.target.value)} error={errors.bedrooms} />
        <Input label="Bathrooms" type="number" min={0} value={form.bathrooms} onChange={(e) => updateField('bathrooms', e.target.value)} error={errors.bathrooms} />
        <Input label="Square Feet" type="number" value={form.square_feet || ''} onChange={(e) => updateField('square_feet', e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Monthly Rent (KES)" type="number" min={0} value={form.rent_amount} onChange={(e) => updateField('rent_amount', e.target.value)} error={errors.rent_amount} required />
        <Select
          label="Status"
          value={form.status}
          onChange={(e) => updateField('status', e.target.value)}
          options={Object.entries(UNIT_STATUSES).map(([value, { label }]) => ({ value, label }))}
        />
      </div>
      <Button type="submit" loading={loading}>Create Unit</Button>
    </form>
  );
}
