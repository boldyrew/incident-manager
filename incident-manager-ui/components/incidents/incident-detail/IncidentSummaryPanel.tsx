'use client';

import { InlineEditableText, InlineEditableTextarea } from '@/components/editable/InlineEditable';
import { ContentPanel } from '@/components/layout/ContentPanel';
import { Badge } from '@/components/ui/badge';
import { useIncidentDetail } from '@/context/incident-context';
import { useUserRole } from '@/hooks/useUserRole';
import { updateIncidentDescription, updateIncidentTitle } from '@/lib/api';
import {
  getIncidentSeverityBadgeVariant,
  getIncidentStatusBadgeVariant,
} from '@/lib/incidentBadgeVariants';
import { incidentSeverityLabel } from '@/lib/incidentSeverityLabels';
import { incidentStatusLabel } from '@/lib/incidentStatusLabels';
import { useCallback } from 'react';

export function IncidentSummaryPanel() {
  const { incidentId, incident, refetch, refetchActivities } = useIncidentDetail();
  const { isStaffRole } = useUserRole();

  const saveTitle = useCallback(
    async (title: string) => {
      await updateIncidentTitle(incidentId, title);
      await Promise.all([refetch(), refetchActivities()]);
    },
    [incidentId, refetch, refetchActivities],
  );

  const saveDescription = useCallback(
    async (description: string) => {
      await updateIncidentDescription(incidentId, description);
      await Promise.all([refetch(), refetchActivities()]);
    },
    [incidentId, refetch, refetchActivities],
  );

  return (
    <ContentPanel>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge
          variant={getIncidentSeverityBadgeVariant(incident.severity)}
          label={incidentSeverityLabel[incident.severity]}
        />
        <Badge
          variant={getIncidentStatusBadgeVariant(incident.status)}
          label={incidentStatusLabel[incident.status]}
        />
      </div>
      <InlineEditableText
        value={incident.title}
        onSave={saveTitle}
        label="Title"
        placeholder="Incident title"
        displayClassName="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
        disabled={!isStaffRole}
      />
      <div className="mt-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Description
        </p>
        <InlineEditableTextarea
          value={incident.description ?? ''}
          onSave={saveDescription}
          label="Description"
          placeholder="Add a description…"
          emptyText="Click to add a description…"
          disabled={!isStaffRole}
        />
      </div>
    </ContentPanel>
  );
}
