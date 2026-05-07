'use client';

import { ContentPanel } from '@/components/layout/ContentPanel';
import type { TicketBase } from '@/types/ticket';
import Link from 'next/link';

export interface TicketLinkedIncidentCardProps {
  ticket: TicketBase;
}

export function TicketLinkedIncidentCard({ ticket }: TicketLinkedIncidentCardProps) {
  return (
    <ContentPanel title='Linked Incident'>
      <div className="rounded-lg border border-border bg-background/80 p-4">
        <Link href="/incidents" className="text-sm font-medium text-blue-400 hover:text-blue-300">
          {/* {ticket.linkedIncident} */}
        </Link>
        {/* <p className="mt-1 text-sm text-foreground">{ticket.linkedIncidentTitle}</p> */}
        {/* <div className="mt-3">
          <Badge
            variant={getTicketSeverityBadgeVariant(ticket.linkedIncidentSeverity)}
            label={ticket.linkedIncidentSeverity}
          /> */}
        {/* </div> */}
      </div>
    </ContentPanel>
  );
}
