import { BarChart } from '@/components/charts/BarChart';
import { DashboardStats } from '@/types/dashboard';

interface IncidentsBySeverityChartProps {
  stats: DashboardStats | null;
}

export function IncidentsBySeverityChart({ stats }: IncidentsBySeverityChartProps) {
  const chartData = stats
    ? [
        { name: 'Critical', count: stats.incidentsBySeverity.CRITICAL },
        { name: 'High', count: stats.incidentsBySeverity.HIGH },
        { name: 'Medium', count: stats.incidentsBySeverity.MEDIUM },
        { name: 'Low', count: stats.incidentsBySeverity.LOW },
      ]
    : [];

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="text-base font-semibold text-foreground mb-4">Incidents by Severity</h2>
      <BarChart data={chartData} xDataKey="name" yDataKey="count" />
    </div>
  );
}
