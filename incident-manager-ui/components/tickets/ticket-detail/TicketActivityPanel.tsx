'use client';

import { ContentPanel } from '@/components/layout/ContentPanel';
import { useFormatDateTime } from '@/hooks/useFormatDateTime';
import {
  getActivityActorName,
  getActivityContent,
  getActivityDescription,
  getActivityVisualType,
  type TicketActivityVisualType,
} from '@/lib/ticketActivityDisplay';
import type { TicketActivity } from '@/types/ticket-activity';
import { CheckCircle, Clock, Link2, MessageSquare, Pencil, User } from 'lucide-react';

function activityIcon(type: TicketActivityVisualType) {
  switch (type) {
    case 'status_change':
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 ring-4 ring-card">
          <CheckCircle className="h-4 w-4" strokeWidth={2.5} />
        </div>
      );
    case 'comment':
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 ring-4 ring-card">
          <MessageSquare className="h-4 w-4" />
        </div>
      );
    case 'created':
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ring-4 ring-card">
          <Clock className="h-4 w-4" />
        </div>
      );
    case 'assigned':
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 ring-4 ring-card">
          <User className="h-4 w-4" />
        </div>
      );
    case 'updated':
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 ring-4 ring-card">
          <Pencil className="h-4 w-4" />
        </div>
      );
    default:
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ring-4 ring-card">
          <Link2 className="h-4 w-4" />
        </div>
      );
  }
}

export interface TicketActivityPanelProps {
  activities: TicketActivity[];
  loading?: boolean;
  error?: string | null;
}

export function TicketActivityPanel({ activities, loading, error }: TicketActivityPanelProps) {
  const { formatDateTime } = useFormatDateTime();

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
            {activities.map((activity) => {
              const content = getActivityContent(activity);
              const visualType = getActivityVisualType(activity.type);

              return (
                <li key={activity.id} className="flex gap-4">
                  <div className="relative z-[1] shrink-0">{activityIcon(visualType)}</div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{getActivityActorName(activity)}</span>
                        <span className="text-muted-foreground">
                          {' '}
                          • {getActivityDescription(activity)}
                        </span>
                      </p>
                      <time className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {formatDateTime(activity.createdAt)}
                      </time>
                    </div>
                    {content ? (
                      <div className="mt-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground/90">
                        {content}
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </ContentPanel>
  );
}
