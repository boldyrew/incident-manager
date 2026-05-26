'use client';

import { SeverityBadge } from '@/components/incidents/SeverityBadge';
import { StatusBadge } from '@/components/incidents/StatusBadge';
import { ContentPanel } from '@/components/layout/ContentPanel';
import { useIncidentDetail } from '@/context/incident-context';

export function IncidentSummaryPanel() {
  const { incident } = useIncidentDetail();
  return (
    <ContentPanel>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SeverityBadge severity={incident.severity} />
        <StatusBadge status={incident.status} />
      </div>
      <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {incident.title}
      </h1>
      {incident.description && (
        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Description
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">{incident.description}</p>
        </div>
      )}
    </ContentPanel>
  );
}
