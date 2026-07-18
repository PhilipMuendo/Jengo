'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const BRAND = '#059669';
const TRACK = '#e2e8f0';

/**
 * Occupancy is one headline number, so this renders as a gauge: a brand
 * arc over a neutral track with the rate as a hero figure in the center.
 * The values are stated in text below — the color never carries the data
 * alone.
 */
export function OccupancyChart({ occupancyRate }: { occupancyRate: number }) {
  const clamped = Math.max(0, Math.min(100, occupancyRate));
  const data = [
    { name: 'Occupied', value: clamped },
    { name: 'Vacant', value: 100 - clamped },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Occupancy</CardTitle>
        <CardDescription>Share of units currently occupied</CardDescription>
      </CardHeader>
      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius={72}
              outerRadius={92}
              paddingAngle={clamped > 0 && clamped < 100 ? 1 : 0}
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill={BRAND} />
              <Cell fill={TRACK} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tabular-nums tracking-tight text-gray-900">
            {clamped}%
          </span>
          <span className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
            occupied
          </span>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-6 text-sm">
        <span className="flex items-center gap-2 text-gray-600">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: BRAND }} />
          Occupied {clamped}%
        </span>
        <span className="flex items-center gap-2 text-gray-600">
          <span className="h-2.5 w-2.5 rounded-full border border-gray-300" style={{ background: TRACK }} />
          Vacant {100 - clamped}%
        </span>
      </div>
    </Card>
  );
}
