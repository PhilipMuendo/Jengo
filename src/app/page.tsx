import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  Building2, CreditCard, Wrench, Users, ArrowRight, Check, Smartphone,
} from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

const features = [
  {
    icon: CreditCard,
    title: 'M-Pesa Rent Collection',
    description: 'Native STK Push integration. Tenants pay rent directly from their phones — payments reconcile against invoices automatically.',
  },
  {
    icon: Building2,
    title: 'Multi-Building Portfolio',
    description: 'Every building, floor, and unit in one dashboard, with occupancy and revenue rolled up across the portfolio.',
  },
  {
    icon: Wrench,
    title: 'Maintenance Tracking',
    description: 'Tenants report issues, managers assign caretakers, and every request keeps a full audit trail to resolution.',
  },
  {
    icon: Users,
    title: 'Tenant Portal',
    description: 'A self-service portal for rent payments, maintenance requests, and building notices — less phone tag for your team.',
  },
];

const plans = [
  {
    name: 'Silver',
    price: '5,000',
    highlight: false,
    features: ['Up to 2 buildings', 'Up to 100 units', 'M-Pesa integration', 'Tenant portal'],
  },
  {
    name: 'Gold',
    price: '12,000',
    highlight: true,
    features: ['Up to 5 buildings', 'Up to 300 units', 'M-Pesa integration', 'Tenant portal', 'SMS notices', 'Priority support'],
  },
  {
    name: 'Platinum',
    price: '25,000',
    highlight: false,
    features: ['Unlimited buildings', 'Unlimited units', 'M-Pesa integration', 'Tenant portal', 'SMS notices', 'Dedicated support'],
  },
];

const stats = [
  { value: 'M-Pesa', label: 'native STK Push' },
  { value: '14 days', label: 'free trial' },
  { value: '4 roles', label: 'owner to caretaker' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">J</div>
            <span className="text-lg font-semibold tracking-tight text-gray-900">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/auth/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Sign In
            </Link>
            <Link href="/auth/signup"><Button size="sm">Start Free Trial</Button></Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b from-brand-50 via-white to-white"
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-medium text-brand-700 shadow-sm">
            <Smartphone className="h-4 w-4" /> Built for Kenyan property managers
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Run your buildings.
            <br />
            <span className="text-brand-600">Rent collects itself.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
            Jengo automates M-Pesa rent collection, invoicing, maintenance, and tenant
            communication for high-rise residential buildings — Across Kenya.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/auth/signup">
              <Button size="lg">
                Start 14-Day Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>
          <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-3 divide-x divide-gray-200">
            {stats.map((s) => (
              <div key={s.label} className="px-4">
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">{s.value}</dd>
                <dd className="mt-1 text-xs text-gray-500 sm:text-sm">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-gray-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Everything you need to manage your buildings
            </h2>
            <p className="mt-3 text-gray-600">
              One system for owners, property managers, caretakers, and tenants.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                    <Icon className="h-5 w-5 text-brand-700" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Simple, transparent pricing</h2>
            <p className="mt-3 text-gray-600">
              Every plan starts with a 14-day free trial. Prices in KES per month.
            </p>
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 items-stretch gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={
                  plan.highlight
                    ? 'relative flex flex-col rounded-2xl border-2 border-brand-600 bg-white p-8 shadow-lg'
                    : 'flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'
                }
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{plan.name}</h3>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">KES {plan.price}</span>
                  <span className="text-sm text-gray-500">/month</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-gray-600">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className="mt-8 block">
                  <Button variant={plan.highlight ? 'primary' : 'outline'} className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sidebar">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white">
            Stop chasing rent. Start managing.
          </h2>
          <p className="max-w-xl text-gray-300">
            Set up your first building in minutes — no card required for the trial.
          </p>
          <Link href="/auth/signup">
            <Button size="lg">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-gray-500 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-brand-600 text-xs font-bold text-white">J</div>
            <span>&copy; {new Date().getFullYear()} {APP_NAME}</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-gray-700">Help</a>
            <a href="#" className="transition-colors hover:text-gray-700">Privacy</a>
            <a href="#" className="transition-colors hover:text-gray-700">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
