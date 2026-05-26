'use client';

import { ContentPanel } from '@/components/layout/ContentPanel';
import type { TicketActivity } from '@/types/ticket-activity';
import { TicketActivityItem } from './TicketActivityItem';

export interface TicketActivityPanelProps {
  activities: TicketActivity[];
  loading?: boolean;
  error?: string | null;
}

export function TicketActivityPanel({ activities, loading, error }: TicketActivityPanelProps) {
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
              <TicketActivityItem key={activity.id} activity={activity} />
            ))}
          </ul>
        </div>
      )}
    </ContentPanel>
  );
}
