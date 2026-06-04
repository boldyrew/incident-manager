export interface DashboardStats {
  openIncidents: number;
  criticalIncidents: number;
  resolvedThisWeek: number;
  slaBreaches: number;
  incidentsBySeverity: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  incidentsOverTime: { day: string; count: number }[];
}

export interface RecentIncident {
  id: string;
  code: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  client: string;
  detectedAt: string;
  tenant: { id: string; name: string; alias: string } | null;
}
