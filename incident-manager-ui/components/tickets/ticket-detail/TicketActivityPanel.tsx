'use client';

import { CheckCircle, Clock, MessageSquare, User } from 'lucide-react';
import type { TicketActivityItem, TicketActivityType } from '@/types/ticket';
import { ContentPanel } from '@/components/layout/ContentPanel';

function activityIcon(type: TicketActivityType) {
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
    default:
      return null;
  }
}

export interface TicketActivityPanelProps {
  items: TicketActivityItem[];
}

export function TicketActivityPanel({ items }: TicketActivityPanelProps) {
  return (
    <ContentPanel title='Activity'>
      <div className="relative">
        <div className="absolute bottom-6 left-[17px] top-2 w-px bg-border" aria-hidden />
        <ul className="relative space-y-6">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4">
              <div className="relative z-[1] shrink-0">{activityIcon(item.type)}</div>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{item.user}</span>
                    <span className="text-muted-foreground"> • {item.action}</span>
                  </p>
                  <time className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {item.timestamp}
                  </time>
                </div>
                {item.content ? (
                  <div className="mt-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground/90">
                    {item.content}
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ContentPanel>
  );
}
