'use client';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { signupOrganizationSchema } from '@/lib/validations/auth.schema';
import { KENYAN_COUNTIES } from '@/lib/constants';
import { useState } from 'react';

interface Props {
  data: { organizationName: string; businessType: string; address: string; city: string; county: string };
  onUpdate: (data: Partial<Props['data']>) => void;
  onNext: () => void;
  onBack: () => void;
}

const businessTypes = [
  { value: 'individual', label: 'Individual Owner' },
  { value: 'company', label: 'Property Company' },
  { value: 'trust', label: 'Family Trust' },
  { value: 'cooperative', label: 'Housing Cooperative' },
];

export function Step2Organization({ data, onUpdate, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleNext() {
    const result = signupOrganizationSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    onNext();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Your organization</h2>
      <Input label="Organization Name" value={data.organizationName} onChange={(e) => onUpdate({ organizationName: e.target.value })} error={errors.organizationName} required />
      <Select label="Business Type" options={businessTypes} value={data.businessType} onChange={(e) => onUpdate({ businessType: e.target.value })} error={errors.businessType} placeholder="Select type" />
      <Input label="Address" value={data.address} onChange={(e) => onUpdate({ address: e.target.value })} />
      <Input label="City" value={data.city} onChange={(e) => onUpdate({ city: e.target.value })} error={errors.city} required />
      <Select
        label="County"
        options={KENYAN_COUNTIES.map((c) => ({ value: c, label: c }))}
        value={data.county}
        onChange={(e) => onUpdate({ county: e.target.value })}
        error={errors.county}
      />
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={handleNext} className="flex-1">Continue</Button>
      </div>
    </div>
  );
}
