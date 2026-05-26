'use client';

import { SeverityBadge } from '@/components/incidents/SeverityBadge';
import { ContentPanel } from '@/components/layout/ContentPanel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserItem } from '@/components/user/UserItem';
import { useIncidentDetail } from '@/context/incident-context';
import { useFormatDateTime } from '@/hooks/useFormatDateTime';
import { useUserRole } from '@/hooks/useUserRole';
import { updateIncident } from '@/lib/api';
import type { IncidentStatus } from '@/types/incident';

const statusLabels: Record<IncidentStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export function IncidentDetailsPanel() {
  const { incident, refetch } = useIncidentDetail();
  const { formatDateTime } = useFormatDateTime();
  const { isStaffRole } = useUserRole();

  const handleStatusChange = async (status: IncidentStatus) => {
    await updateIncident(incident.id, { status });
    await refetch();
  };

  return (
    <ContentPanel title="Incident Details">
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Incident ID</dt>
          <dd className="mt-0.5 font-medium text-blue-400">{incident.code}</dd>
        </div>
        <div>
          <dt className="mb-1.5 text-muted-foreground">Severity</dt>
          <dd>
            <SeverityBadge severity={incident.severity} />
          </dd>
        </div>
        <div>
          <dt className="mb-1.5 text-muted-foreground">Status</dt>
          <dd>
            <Select
              value={incident.status}
              onValueChange={handleStatusChange}
              disabled={!isStaffRole}
            >
              <SelectTrigger className="h-9 bg-secondary/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(statusLabels) as IncidentStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Client</dt>
          <dd className="mt-0.5 text-foreground">{incident.client}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Assigned To</dt>
          {incident.assignedUser ? (
            <dd className="mt-1.5">
              <UserItem user={incident.assignedUser} />
            </dd>
          ) : (
            <dd className="mt-1.5 text-muted-foreground">Unassigned</dd>
          )}
        </div>
        <div>
          <dt className="text-muted-foreground">Detected At</dt>
          <dd className="mt-0.5 text-foreground">{formatDateTime(incident.detectedAt)}</dd>
        </div>
      </dl>
    </ContentPanel>
  );
}
