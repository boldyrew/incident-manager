'use client';

import { ContentPanel } from '@/components/layout/ContentPanel';
import type { IncidentActivity } from '@/types/incident-activity';
import { IncidentActivityItem } from './IncidentActivityItem';

export interface IncidentActivityPanelProps {
  activities: IncidentActivity[];
  loading?: boolean;
  error?: string | null;
}

export function IncidentActivityPanel({ activities, loading, error }: IncidentActivityPanelProps) {
  return (
    <ContentPanel title="Activity">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading activity…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        <div className="relative">
          <div className="absolute bottom-6 left-[17px] top-2 w-px bg-border" aria-hidden />
          <ul className="relative space-y-6">
            {activities.map((activity) => (
              <IncidentActivityItem key={activity.id} activity={activity} />
            ))}
          </ul>
        </div>
      )}
    </ContentPanel>
  );
}
