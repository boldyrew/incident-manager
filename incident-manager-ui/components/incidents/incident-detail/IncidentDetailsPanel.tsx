'use client';

import { InlineEditableBadgeSelect } from '@/components/editable/InlineEditable';
import { ContentPanel } from '@/components/layout/ContentPanel';
import { UserItem } from '@/components/user/UserItem';
import { useIncidentDetail } from '@/context/incident-context';
import { useFormatDateTime } from '@/hooks/useFormatDateTime';
import { useUserRole } from '@/hooks/useUserRole';
import { updateIncidentSeverity, updateIncidentStatus } from '@/lib/api';
import {
  getIncidentSeverityBadgeVariant,
  getIncidentStatusBadgeVariant,
} from '@/lib/incidentBadgeVariants';
import { incidentSeverityLabel } from '@/lib/incidentSeverityLabels';
import { incidentStatusLabel } from '@/lib/incidentStatusLabels';
import type { IncidentSeverity, IncidentStatus } from '@/types/incident';
import { useCallback } from 'react';

const severityOptions = (Object.keys(incidentSeverityLabel) as IncidentSeverity[]).map(
  (value) => ({
    value,
    label: incidentSeverityLabel[value],
  }),
);

const statusOptions = (Object.keys(incidentStatusLabel) as IncidentStatus[]).map((value) => ({
  value,
  label: incidentStatusLabel[value],
}));

export function IncidentDetailsPanel() {
  const { incidentId, incident, refetch, refetchActivities } = useIncidentDetail();
  const { formatDateTime } = useFormatDateTime();
  const { isStaffRole } = useUserRole();

  const saveSeverity = useCallback(
    async (severity: IncidentSeverity) => {
      await updateIncidentSeverity(incidentId, severity);
      await Promise.all([refetch(), refetchActivities()]);
    },
    [incidentId, refetch, refetchActivities],
  );

  const saveStatus = useCallback(
    async (status: IncidentStatus) => {
      await updateIncidentStatus(incidentId, status);
      await Promise.all([refetch(), refetchActivities()]);
    },
    [incidentId, refetch, refetchActivities],
  );

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
            <InlineEditableBadgeSelect
              value={incident.severity}
              options={severityOptions}
              onSave={saveSeverity}
              getBadgeVariant={getIncidentSeverityBadgeVariant}
              label="Severity"
              className="w-full"
              disabled={!isStaffRole}
            />
          </dd>
        </div>
        <div>
          <dt className="mb-1.5 text-muted-foreground">Status</dt>
          <dd>
            <InlineEditableBadgeSelect
              value={incident.status}
              options={statusOptions}
              onSave={saveStatus}
              getBadgeVariant={getIncidentStatusBadgeVariant}
              label="Status"
              className="w-full"
              disabled={!isStaffRole}
            />
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
