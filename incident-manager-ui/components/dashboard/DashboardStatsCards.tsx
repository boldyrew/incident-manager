import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { DashboardStats } from '@/types/dashboard';
import { DashboardStatCard } from './DashboardStatCard';

interface DashboardStatsCardsProps {
  stats: DashboardStats | null;
}

export function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <DashboardStatCard
        icon={<AlertTriangle className="h-5 w-5 text-orange-400" />}
        iconBg="bg-orange-400/10"
        label="Open Incidents"
        value={stats?.openIncidents ?? 0}
        trend={12}
        trendLabel="vs last week"
      />
      <DashboardStatCard
        icon={<XCircle className="h-5 w-5 text-red-400" />}
        iconBg="bg-red-400/10"
        label="Critical Incidents"
        value={stats?.criticalIncidents ?? 0}
        trend={-3}
        trendLabel="vs last week"
      />
      <DashboardStatCard
        icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
        iconBg="bg-emerald-400/10"
        label="Resolved This Week"
        value={stats?.resolvedThisWeek ?? 0}
        trend={18}
        trendLabel="vs last week"
      />
      <DashboardStatCard
        icon={<Clock className="h-5 w-5 text-yellow-400" />}
        iconBg="bg-yellow-400/10"
        label="SLA Breaches"
        value={stats?.slaBreaches ?? 0}
        trend={-50}
        trendLabel="vs last week"
      />
    </div>
  );
}
