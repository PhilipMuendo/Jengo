'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Step1Account } from './steps/step-1-account';
import { Step2Organization } from './steps/step-2-organization';
import { Step3Billing } from './steps/step-3-billing';
import { createClient } from '@/lib/supabase/client';

const STEPS = ['Account', 'Organization', 'Billing'];

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', fullName: '', phone: '',
    organizationName: '', businessType: '', address: '', city: 'Nairobi', county: 'Nairobi',
    tier: 'silver' as 'silver' | 'gold' | 'platinum',
  });

  function updateFormData(data: Partial<typeof formData>) {
    setFormData((prev) => ({ ...prev, ...data }));
  }

  async function handleComplete() {
    setLoading(true);
    setError('');

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (!response.ok) {
      setError(result.error || 'Failed to create account');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (signInError) {
      setError('Account created. Please sign in.');
      router.push('/auth/login');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xl mb-4">
            J
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Start your free trial</h1>
          <p className="text-gray-500 mt-1">Manage your buildings with Jengo</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i <= step ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${i <= step ? 'text-gray-900' : 'text-gray-400'}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-300" />}
            </div>
          ))}
        </div>

        <Card>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === 0 && (
            <Step1Account data={formData} onUpdate={updateFormData} onNext={() => setStep(1)} />
          )}
          {step === 1 && (
            <Step2Organization data={formData} onUpdate={updateFormData} onNext={() => setStep(2)} onBack={() => setStep(0)} />
          )}
          {step === 2 && (
            <Step3Billing data={formData} onUpdate={updateFormData} onComplete={handleComplete} onBack={() => setStep(1)} loading={loading} />
          )}
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
