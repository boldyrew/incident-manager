'use client';

import { ContentPanel } from '@/components/layout/ContentPanel';
import { Badge } from '@/components/ui/badge';
import {
  getTicketSeverityBadgeVariant,
  getTicketStatusBadgeVariant,
} from '@/lib/ticketBadgeVariants';
import type { TicketStatus } from '@/types/ticket';
import type { TicketDetailModel } from '@/types/ticket';

export interface TicketSummaryCardProps {
  ticket: Pick<TicketDetailModel, 'title' | 'description' | 'severity'>;
  status: TicketStatus;
}

export function TicketSummaryCard({ ticket, status }: TicketSummaryCardProps) {
  return (
    <ContentPanel>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant={getTicketSeverityBadgeVariant(ticket.severity)} label={ticket.severity} />
        <Badge variant={getTicketStatusBadgeVariant(status)} label={status.replace('_', ' ')} />
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
