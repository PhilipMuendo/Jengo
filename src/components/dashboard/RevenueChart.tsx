'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', revenue: 450000 },
  { month: 'Feb', revenue: 520000 },
  { month: 'Mar', revenue: 480000 },
  { month: 'Apr', revenue: 610000 },
  { month: 'May', revenue: 550000 },
  { month: 'Jun', revenue: 670000 },
];

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}K`} />
          <Tooltip formatter={(value) => [`KES ${Number(value ?? 0).toLocaleString()}`, 'Revenue']} />
          <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
