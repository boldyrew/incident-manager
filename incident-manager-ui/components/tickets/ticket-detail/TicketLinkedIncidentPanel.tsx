'use client';

import { SeverityBadge } from '@/components/incidents/SeverityBadge';
import { ContentPanel } from '@/components/layout/ContentPanel';
import { useTicketDetail } from '@/context/ticket-context';
import Link from 'next/link';

export function TicketLinkedIncidentPanel() {
  const { ticket } = useTicketDetail();
  return (
    <ContentPanel title="Linked Incident">
      {ticket.incident ? (
        <div className="rounded-lg border border-border bg-background/80 p-4">
          <Link href="/incidents" className="text-sm font-medium text-blue-400 hover:text-blue-300">
            {ticket.incident.title}
          </Link>
          <div className="mt-3">
            <SeverityBadge severity={ticket.incident.severity} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No incident linked</p>
      )}
    </ContentPanel>
  );
}
