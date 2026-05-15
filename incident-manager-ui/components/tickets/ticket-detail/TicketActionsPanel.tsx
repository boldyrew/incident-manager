'use client';

import { ContentPanel } from '@/components/layout/ContentPanel';
import { Button } from '@/components/ui/button';
import { TicketLinkIncidentDialog } from '@/components/tickets/ticket-detail/TicketLinkIncidentDialog';
import { TicketReassignDialog } from '@/components/tickets/ticket-detail/TicketReassignDialog';
import { useState } from 'react';

export function TicketActionsPanel() {
  const [reassignOpen, setReassignOpen] = useState(false);
  const [linkIncidentOpen, setLinkIncidentOpen] = useState(false);

  return (
    <ContentPanel title="Actions">
      <div className="flex flex-col gap-2">
        <Button className="w-full" type="button" onClick={() => setReassignOpen(true)}>
          Reassign Ticket
        </Button>
        <Button
          variant="secondary"
          className="w-full bg-secondary hover:bg-secondary/80"
          type="button"
          onClick={() => setLinkIncidentOpen(true)}
        >
          Link to Incident
        </Button>
        <Button variant="secondary" className="w-full bg-secondary hover:bg-secondary/80">
          Export Details
        </Button>
      </div>

      <TicketReassignDialog open={reassignOpen} onOpenChange={setReassignOpen} />
      <TicketLinkIncidentDialog open={linkIncidentOpen} onOpenChange={setLinkIncidentOpen} />
    </ContentPanel>
  );
}
