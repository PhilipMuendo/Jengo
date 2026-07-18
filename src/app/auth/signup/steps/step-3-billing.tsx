'use client';

import { Button } from '@/components/ui/Button';
import { SUBSCRIPTION_TIERS } from '@/lib/constants';
import { formatKES } from '@/lib/utils/currency';
import { cn } from '@/lib/utils/format';
import { Check } from 'lucide-react';

interface Props {
  data: { tier: 'silver' | 'gold' | 'platinum' };
  onUpdate: (data: { tier: 'silver' | 'gold' | 'platinum' }) => void;
  onComplete: () => void;
  onBack: () => void;
  loading: boolean;
}

const tierFeatures = {
  silver: ['Up to 2 buildings', '100 units', 'M-Pesa integration', 'Basic reports'],
  gold: ['Up to 5 buildings', '300 units', 'SMS notifications', 'Advanced reports'],
  platinum: ['Unlimited buildings', 'Unlimited units', 'Priority support', 'Custom integrations'],
};

export function Step3Billing({ data, onUpdate, onComplete, onBack, loading }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Choose your plan</h2>
      <p className="text-sm text-gray-500">14-day free trial on all plans. No credit card required.</p>

      <div className="space-y-3">
        {(Object.keys(SUBSCRIPTION_TIERS) as Array<keyof typeof SUBSCRIPTION_TIERS>).map((tier) => {
          const plan = SUBSCRIPTION_TIERS[tier];
          const isSelected = data.tier === tier;
          return (
            <button
              key={tier}
              type="button"
              onClick={() => onUpdate({ tier })}
              className={cn(
                'w-full rounded-xl border-2 p-4 text-left transition-colors',
                isSelected ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{plan.name}</p>
                  <p className="text-sm text-gray-500">{formatKES(plan.price)}/month</p>
                </div>
                {isSelected && <Check className="h-5 w-5 text-brand-600" />}
              </div>
              <ul className="mt-3 space-y-1">
                {tierFeatures[tier].map((f) => (
                  <li key={f} className="text-xs text-gray-600 flex items-center gap-1">
                    <Check className="h-3 w-3 text-brand-500" /> {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onComplete} className="flex-1" loading={loading}>Start Free Trial</Button>
      </div>
    </div>
  );
}
