'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';
import { loginSchema } from '@/lib/validations/auth.schema';
import { ROLE_REDIRECTS } from '@/types/auth.types';
import type { UserRole } from '@/types/database.types';

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

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    const redirect = profile?.role ? ROLE_REDIRECTS[profile.role as UserRole] : '/dashboard';
    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-xl font-bold text-white shadow-sm">
            J
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome back</h1>
          <p className="mt-1 text-gray-500">Sign in to your Jengo account</p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-5">
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
            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-gray-600 select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 transition-colors focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                />
                Remember me
              </label>
              <Link
                href="/auth/forgot-password"
                className="font-medium text-emerald-600 transition-colors hover:text-emerald-700"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="font-medium text-emerald-600 transition-colors hover:text-emerald-700">
            Start free trial
          </Link>
        </p>
      </div>
    </div>
  );
}
