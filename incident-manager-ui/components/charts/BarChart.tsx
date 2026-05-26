'use client';

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DataKey } from 'recharts/types/util/types';

type ChartDatum = Record<string, string | number>;

interface BarChartProps<TData extends ChartDatum> {
  data: TData[];
  xDataKey: DataKey<TData>;
  yDataKey: DataKey<TData, number>;
  height?: number;
  barSize?: number;
  color?: string;
}

export function BarChart<TData extends ChartDatum>({
  data,
  xDataKey,
  yDataKey,
  height = 220,
  barSize = 36,
  color = '#6096ff',
}: BarChartProps<TData>) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} barSize={barSize}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey={xDataKey}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))',
          }}
          cursor={{ fill: 'hsl(var(--accent))' }}
        />
        <Bar dataKey={yDataKey} fill={color} radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
