import { AlertTriangle, Building2, CheckCircle2, XCircle } from 'lucide-react';
import { TenantStats } from '@/types/tenant';
import { ClientSummaryCard } from './ClientSummaryCard';

interface ClientStatsCardsProps {
  stats: TenantStats | null;
}

export function ClientStatsCards({ stats }: ClientStatsCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <ClientSummaryCard
        icon={<Building2 className="h-5 w-5 text-blue-400" />}
        iconBg="bg-blue-400/10"
        label="Total Clients"
        value={stats?.totalClients ?? 0}
      />
      <ClientSummaryCard
        icon={<AlertTriangle className="h-5 w-5 text-orange-400" />}
        iconBg="bg-orange-400/10"
        label="Total Open Incidents"
        value={stats?.openIncidents ?? 0}
      />
      <ClientSummaryCard
        icon={<XCircle className="h-5 w-5 text-red-400" />}
        iconBg="bg-red-400/10"
        label="Critical Incidents"
        value={stats?.criticalIncidents ?? 0}
      />
      <ClientSummaryCard
        icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
        iconBg="bg-emerald-400/10"
        label="Resolved This Month"
        value={stats?.resolvedThisMonth ?? 0}
      />
    </div>
  );
}
