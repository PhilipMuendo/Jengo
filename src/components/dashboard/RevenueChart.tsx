'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { RevenuePoint } from '@/services/dashboard';

const BRAND = '#059669';

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const hasRevenue = data.some((d) => d.revenue > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
        <CardDescription>Confirmed payments, last {data.length} months</CardDescription>
      </CardHeader>
      {hasRevenue ? (
        <ResponsiveContainer width="100%" height={264}>
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              width={44}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : `${v}`)}
            />
            <Tooltip
              cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                fontSize: 13,
              }}
              formatter={(value) => [`KES ${Number(value ?? 0).toLocaleString()}`, 'Revenue']}
            />
            <Bar dataKey="revenue" fill={BRAND} radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[264px] items-center justify-center text-sm text-gray-400">
          No confirmed payments yet
        </div>
      )}
    </Card>
  );
}
