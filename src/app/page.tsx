import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Building2, CreditCard, Wrench, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

const features = [
  { icon: CreditCard, title: 'M-Pesa Rent Collection', description: 'Native STK Push integration. Tenants pay rent directly from their phones.' },
  { icon: Building2, title: 'Multi-Building Management', description: 'Manage your entire portfolio from one dashboard. Perfect for high-rise buildings.' },
  { icon: Wrench, title: 'Maintenance Tracking', description: 'Tenants submit requests, managers assign and resolve. Full audit trail.' },
  { icon: Users, title: 'Tenant Portal', description: 'Self-service portal for rent payments, maintenance requests, and notices.' },
];

const plans = [
  { name: 'Silver', price: '5,000', units: '100 units', buildings: '2 buildings' },
  { name: 'Gold', price: '12,000', units: '300 units', buildings: '5 buildings' },
  { name: 'Platinum', price: '25,000', units: 'Unlimited', buildings: 'Unlimited' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm">J</div>
            <span className="font-bold text-gray-900 text-lg">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">Sign In</Link>
            <Link href="/auth/signup"><Button size="sm">Start Free Trial</Button></Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm text-emerald-700 mb-6">
            <CheckCircle className="h-4 w-4" /> Built for Kenyan property managers
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
            Property Management<br />
            <span className="text-emerald-600">Made for Kenya</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">{APP_TAGLINE}. Automate M-Pesa rent collection, maintenance, and tenant communication for Nairobi high-rises.</p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup"><Button size="lg">Start 14-Day Free Trial <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/auth/login"><Button variant="outline" size="lg">Sign In</Button></Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Everything you need to manage your buildings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 mb-4">
                    <Icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-600">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-center text-gray-600 mb-12">All plans include a 14-day free trial. Prices in KES/month.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.name} className="rounded-xl border border-gray-200 p-6 text-center">
                <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">KES {plan.price}</p>
                <p className="text-sm text-gray-500">/month</p>
                <ul className="mt-6 space-y-2 text-sm text-gray-600">
                  <li>{plan.buildings}</li>
                  <li>{plan.units}</li>
                  <li>M-Pesa integration</li>
                </ul>
                <Link href="/auth/signup" className="block mt-6"><Button variant="outline" className="w-full">Get Started</Button></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {APP_NAME}. Property management for Kenyan high-rises.
        </div>
      </footer>
    </div>
  );
}
