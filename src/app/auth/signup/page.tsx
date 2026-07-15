'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/format';
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg animate-fade-in-up">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-xl font-bold text-white shadow-sm">
            J
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Start your free trial</h1>
          <p className="mt-1 text-gray-500">Manage your buildings with Jengo</p>
        </div>

        <div className="mb-8 flex items-center justify-center">
          {STEPS.map((s, i) => {
            const isComplete = i < step;
            const isCurrent = i === step;
            return (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-200',
                      isComplete && 'bg-emerald-600 text-white',
                      isCurrent && 'bg-emerald-600 text-white ring-4 ring-emerald-100',
                      !isComplete && !isCurrent && 'bg-gray-200 text-gray-500'
                    )}
                  >
                    {isComplete ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      'hidden text-sm transition-colors duration-200 sm:inline',
                      i <= step ? 'font-medium text-gray-900' : 'text-gray-400'
                    )}
                  >
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="mx-3 h-px w-8 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={cn(
                        'h-full bg-emerald-600 transition-all duration-300 ease-out',
                        i < step ? 'w-full' : 'w-0'
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Card padding="lg">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
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

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-emerald-600 transition-colors hover:text-emerald-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
