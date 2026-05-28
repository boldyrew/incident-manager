import { TrendingDown, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';

interface DashboardStatCardProps {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: number;
  trend: number;
  trendLabel: string;
}

export function DashboardStatCard({
  icon,
  iconBg,
  label,
  value,
  trend,
  trendLabel,
}: DashboardStatCardProps) {
  const isUp = trend >= 0;

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-lg ${iconBg}`}>{icon}</div>
        <span
          title={trendLabel}
          className={`flex items-center gap-1 text-xs font-medium ${isUp ? 'text-orange-400' : 'text-emerald-400'}`}
        >
          {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isUp ? '+' : ''}
          {trend}%
        </span>
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}
