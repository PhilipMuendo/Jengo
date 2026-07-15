'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { RevenuePoint } from '@/services/dashboard';

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const hasRevenue = data.some((d) => d.revenue > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
      </CardHeader>
      {hasRevenue ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}K`} />
            <Tooltip formatter={(value) => [`KES ${Number(value ?? 0).toLocaleString()}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[280px] items-center justify-center text-sm text-gray-400">
          No confirmed payments yet
        </div>
      )}
    </Card>
  );
}
