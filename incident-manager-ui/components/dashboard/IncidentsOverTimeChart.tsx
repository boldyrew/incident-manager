import { LinearChart } from '@/components/charts/LinearChart';
import { DashboardStats } from '@/types/dashboard';

interface IncidentsOverTimeChartProps {
  stats: DashboardStats | null;
}

export function IncidentsOverTimeChart({ stats }: IncidentsOverTimeChartProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="text-base font-semibold text-foreground mb-4">Incidents Over Time (7 Days)</h2>
      <LinearChart
        data={stats?.incidentsOverTime ?? []}
        xDataKey="day"
        yDataKey="count"
        gradientId="incidentsOverTimeGradient"
      />
    </div>
  );
}
