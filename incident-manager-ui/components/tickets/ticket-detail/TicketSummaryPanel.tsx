'use client';

import { ContentPanel } from '@/components/layout/ContentPanel';
import { Badge } from '@/components/ui/badge';
import {
  getTicketPriorityBadgeVariant,
  getTicketStatusBadgeVariant,
} from '@/lib/ticketBadgeVariants';
import { ticketStatusLabel } from '@/lib/ticketStatusLabels';
import type { TicketDetailModel } from '@/types/ticket';

export interface TicketSummaryPanelProps {
  ticket: Pick<TicketDetailModel, 'title' | 'description' | 'priority' | 'status' | 'assignedTo'>;
}

export function TicketSummaryPanel({ ticket }: TicketSummaryPanelProps) {
  return (
    <ContentPanel>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant={getTicketPriorityBadgeVariant(ticket.priority)} label={ticket.priority} />
        <Badge
          variant={getTicketStatusBadgeVariant(ticket.status)}
          label={ticketStatusLabel[ticket.status] || ticket.status}
        />
      </div>
      <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {ticket.title}
      </h1>
      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Description
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">{ticket.description}</p>
      </div>
    </ContentPanel>
  );
}
