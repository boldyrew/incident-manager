import { IncidentsTable, IncidentTableItem } from '@/components/incidents/IncidentsTable';
import { RecentIncident } from '@/types/dashboard';

interface RecentIncidentsTableProps {
  incidents: RecentIncident[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 60) return `${mins} min ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function RecentIncidentsTable({ incidents }: RecentIncidentsTableProps) {
  const tableIncidents: IncidentTableItem[] = incidents.map((incident) => ({
    id: incident.id,
    code: incident.code,
    title: incident.title,
    severity: incident.severity,
    status: incident.status,
    client: incident.tenant?.name ?? incident.client,
    detectedAt: incident.detectedAt,
    assignedUser: null,
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="text-base font-semibold text-foreground mb-4">Recent Incidents</h2>
      <IncidentsTable
        incidents={tableIncidents}
        showActions={false}
        showAssignedTo={false}
        detectedAtLabel="Time"
        emptyMessage="No incidents yet"
        formatDetectedAt={timeAgo}
      />
    </div>
  );
}
