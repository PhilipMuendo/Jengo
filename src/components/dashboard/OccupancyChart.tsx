'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export function OccupancyChart({ occupancyRate }: { occupancyRate: number }) {
  const data = [
    { name: 'Occupied', value: occupancyRate },
    { name: 'Vacant', value: 100 - occupancyRate },
  ];
  const COLORS = ['#059669', '#e5e7eb'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Occupancy Rate</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}%`}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${Number(value ?? 0)}%`, '']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
