'use client';

import { ContentPanel } from '@/components/layout/ContentPanel';
import { Button } from '@/components/ui/button';

export function TicketActionsPanel() {
  return (
    <ContentPanel title="Actions">
      <div className="flex flex-col gap-2">
        <Button className="w-full">Reassign Ticket</Button>
        <Button variant="secondary" className="w-full bg-secondary hover:bg-secondary/80">
          Link to Incident
        </Button>
        <Button variant="secondary" className="w-full bg-secondary hover:bg-secondary/80">
          Export Details
        </Button>
      </div>
    </ContentPanel>
  );
}
