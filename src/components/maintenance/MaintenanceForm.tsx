'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { maintenanceSchema, type MaintenanceInput } from '@/lib/validations/maintenance.schema';
import { MAINTENANCE_PRIORITIES } from '@/lib/constants/statuses';
import type { UnitWithBuilding } from '@/services/units';

const CATEGORIES = ['Plumbing', 'Electrical', 'HVAC', 'Structural', 'Appliance', 'Pest Control', 'Other'];

interface MaintenanceFormProps {
  units: UnitWithBuilding[];
  defaultUnitId?: string;
  onSubmit: (data: MaintenanceInput) => Promise<void>;
}

export function MaintenanceForm({ units, defaultUnitId, onSubmit }: MaintenanceFormProps) {
  const [form, setForm] = useState<MaintenanceInput>({
    unit_id: defaultUnitId || units[0]?.id || '',
    category: CATEGORIES[0],
    title: '',
    description: '',
    priority: 'medium',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof MaintenanceInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = maintenanceSchema.safeParse(form);
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
      setErrors({ form: err instanceof Error ? err.message : 'Failed to submit request' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {errors.form && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{errors.form}</div>}
      <Select
        label="Unit"
        value={form.unit_id}
        onChange={(e) => updateField('unit_id', e.target.value)}
        error={errors.unit_id}
        options={units.map((u) => ({ value: u.id, label: `${u.unit_number} · ${u.buildings?.name || ''}` }))}
      />
      <Select
        label="Category"
        value={form.category}
        onChange={(e) => updateField('category', e.target.value)}
        error={errors.category}
        options={CATEGORIES.map((c) => ({ value: c, label: c }))}
      />
      <Input label="Title" value={form.title} onChange={(e) => updateField('title', e.target.value)} error={errors.title} required />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={4}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
      </div>
      <Select
        label="Priority"
        value={form.priority}
        onChange={(e) => updateField('priority', e.target.value)}
        options={Object.entries(MAINTENANCE_PRIORITIES).map(([value, { label }]) => ({ value, label }))}
      />
      <Button type="submit" loading={loading}>Submit Request</Button>
    </form>
  );
}
