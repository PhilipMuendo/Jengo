'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { buildingSchema, type BuildingInput } from '@/lib/validations/building.schema';
import { KENYAN_COUNTIES } from '@/lib/constants';

interface BuildingFormProps {
  initialData?: Partial<BuildingInput>;
  onSubmit: (data: BuildingInput) => Promise<void>;
  submitLabel?: string;
}

export function BuildingForm({ initialData, onSubmit, submitLabel = 'Save Building' }: BuildingFormProps) {
  const [form, setForm] = useState<BuildingInput>({
    name: initialData?.name || '',
    address: initialData?.address || '',
    city: initialData?.city || 'Nairobi',
    county: initialData?.county || 'Nairobi',
    total_floors: initialData?.total_floors || 1,
    year_built: initialData?.year_built,
    caretaker_name: initialData?.caretaker_name || '',
    caretaker_phone: initialData?.caretaker_phone || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof BuildingInput, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = buildingSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await onSubmit(result.data);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Failed to save building' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {errors.form && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {errors.form}
        </div>
      )}
      <Input label="Building Name" value={form.name} onChange={(e) => updateField('name', e.target.value)} error={errors.name} required />
      <Input label="Address" value={form.address} onChange={(e) => updateField('address', e.target.value)} error={errors.address} required />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="City" value={form.city} onChange={(e) => updateField('city', e.target.value)} error={errors.city} required />
        <Select
          label="County"
          value={form.county}
          onChange={(e) => updateField('county', e.target.value)}
          error={errors.county}
          options={KENYAN_COUNTIES.map((c) => ({ value: c, label: c }))}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Total Floors" type="number" min={1} value={form.total_floors} onChange={(e) => updateField('total_floors', e.target.value)} error={errors.total_floors} />
        <Input label="Year Built" type="number" value={form.year_built || ''} onChange={(e) => updateField('year_built', e.target.value)} error={errors.year_built} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Caretaker Name" value={form.caretaker_name || ''} onChange={(e) => updateField('caretaker_name', e.target.value)} />
        <Input label="Caretaker Phone" value={form.caretaker_phone || ''} onChange={(e) => updateField('caretaker_phone', e.target.value)} />
      </div>
      <Button type="submit" loading={loading}>{submitLabel}</Button>
    </form>
  );
}
