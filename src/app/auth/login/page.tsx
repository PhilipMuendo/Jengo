'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { loginSchema } from '@/lib/validations/auth.schema';
import { ROLE_REDIRECTS } from '@/types/auth.types';
import { APP_NAME } from '@/lib/constants';
import type { UserRole } from '@/types/database.types';

const valueProps = [
  'M-Pesa rent collection with automatic reconciliation',
  'Occupancy, arrears, and revenue in one dashboard',
  'Tenant portal for payments and maintenance requests',
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrors({ form: error.message });
      setLoading(false);
      return;
    }

    // Role comes from JWT claims when stamped at creation; older accounts
    // fall back to a profile lookup.
    let role = data.user.app_metadata?.role as UserRole | undefined;
    if (!role) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();
      role = profile?.role as UserRole | undefined;
    }

    router.push(role ? ROLE_REDIRECTS[role] : '/dashboard');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between bg-sidebar p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-base font-bold text-white">J</div>
          <span className="text-lg font-semibold tracking-tight text-white">{APP_NAME}</span>
        </Link>
        <div>
          <h2 className="max-w-md text-3xl font-bold leading-tight tracking-tight text-white">
            Property management, built around M-Pesa.
          </h2>
          <ul className="mt-8 space-y-4">
            {valueProps.map((prop) => (
              <li key={prop} className="flex items-start gap-3 text-gray-300">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-900">
                  <Check className="h-3 w-3 text-brand-400" />
                </span>
                {prop}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {APP_NAME}. Built for Kenyan property managers.
        </p>
      </div>

      <div className="flex w-full items-center justify-center bg-gray-50 px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-base font-bold text-white">J</div>
              <span className="text-lg font-semibold tracking-tight text-gray-900">{APP_NAME}</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome back</h1>
          <p className="mt-1 text-gray-500">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {errors.form && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {errors.form}
              </div>
            )}
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="you@company.co.ke"
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
            />
            <div className="flex items-center justify-end text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-brand-600 transition-colors hover:text-brand-700"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-medium text-brand-600 transition-colors hover:text-brand-700">
              Start free trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
