'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Building } from '@/types/database.types';
import type { NoticeInput } from '@/services/notices';

const noticeSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  body: z.string().min(10, 'Body must be at least 10 characters'),
  type: z.enum(['general', 'maintenance', 'payment', 'emergency']),
  building_id: z.string().optional(),
  sent_to_all_tenants: z.boolean().optional(),
});

interface NoticeFormProps {
  buildings: Building[];
  onSubmit: (data: NoticeInput) => Promise<void>;
}

export function NoticeForm({ buildings, onSubmit }: NoticeFormProps) {
  const [form, setForm] = useState({
    title: '',
    body: '',
    type: 'general' as NoticeInput['type'],
    building_id: '',
    sent_to_all_tenants: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = noticeSchema.safeParse(form);
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
      await onSubmit({
        ...result.data,
        building_id: result.data.building_id || null,
      });
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Failed to publish notice' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {errors.form && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{errors.form}</div>}
      <Input label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} error={errors.title} required />
      <Select
        label="Type"
        value={form.type}
        onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as NoticeInput['type'] }))}
        options={[
          { value: 'general', label: 'General' },
          { value: 'maintenance', label: 'Maintenance' },
          { value: 'payment', label: 'Payment' },
          { value: 'emergency', label: 'Emergency' },
        ]}
      />
      <Select
        label="Building (optional)"
        value={form.building_id}
        onChange={(e) => setForm((p) => ({ ...p, building_id: e.target.value }))}
        options={buildings.map((b) => ({ value: b.id, label: b.name }))}
        placeholder="All buildings"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
        <textarea
          value={form.body}
          onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
          rows={5}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {errors.body && <p className="text-sm text-red-600 mt-1">{errors.body}</p>}
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={form.sent_to_all_tenants}
          onChange={(e) => setForm((p) => ({ ...p, sent_to_all_tenants: e.target.checked }))}
          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
        Send to all tenants
      </label>
      <Button type="submit" loading={loading}>Publish Notice</Button>
    </form>
  );
}
