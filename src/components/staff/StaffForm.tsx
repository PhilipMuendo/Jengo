'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { staffSchema, type StaffInput } from '@/lib/validations/staff.schema';
import { ROLE_LABELS } from '@/types/auth.types';

interface StaffFormProps {
  onSubmit: (data: StaffInput, password: string) => Promise<void>;
}

export function StaffForm({ onSubmit }: StaffFormProps) {
  const [password, setPassword] = useState('');
  const [form, setForm] = useState<StaffInput>({
    full_name: '',
    email: '',
    phone: '',
    role: 'property_manager',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof StaffInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = staffSchema.safeParse(form);
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
      setErrors({ form: err instanceof Error ? err.message : 'Failed to add staff member' });
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
      <Select
        label="Role"
        value={form.role}
        onChange={(e) => updateField('role', e.target.value)}
        options={[
          { value: 'property_manager', label: ROLE_LABELS.property_manager },
          { value: 'caretaker', label: ROLE_LABELS.caretaker },
        ]}
      />
      <Input label="Temporary Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} required />
      <Button type="submit" loading={loading}>Add Staff Member</Button>
    </form>
  );
}
