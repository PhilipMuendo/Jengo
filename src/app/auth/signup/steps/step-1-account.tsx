'use client';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { signupAccountSchema } from '@/lib/validations/auth.schema';
import { useState } from 'react';

interface Props {
  data: { email: string; password: string; confirmPassword: string; fullName: string; phone: string };
  onUpdate: (data: Partial<Props['data']>) => void;
  onNext: () => void;
}

export function Step1Account({ data, onUpdate, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleNext() {
    const result = signupAccountSchema.safeParse(data);
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
      <h2 className="text-lg font-semibold text-gray-900">Create your account</h2>
      <Input label="Full Name" value={data.fullName} onChange={(e) => onUpdate({ fullName: e.target.value })} error={errors.fullName} required />
      <Input label="Email" type="email" value={data.email} onChange={(e) => onUpdate({ email: e.target.value })} error={errors.email} required />
      <Input label="Phone (M-Pesa number)" value={data.phone} onChange={(e) => onUpdate({ phone: e.target.value })} error={errors.phone} placeholder="0712345678" required />
      <Input label="Password" type="password" value={data.password} onChange={(e) => onUpdate({ password: e.target.value })} error={errors.password} required />
      <Input label="Confirm Password" type="password" value={data.confirmPassword} onChange={(e) => onUpdate({ confirmPassword: e.target.value })} error={errors.confirmPassword} required />
      <Button onClick={handleNext} className="w-full">Continue</Button>
    </div>
  );
}
