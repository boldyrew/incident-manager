'use client';

import { ContentPanel } from '@/components/layout/ContentPanel';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserItem } from '@/components/user/UserItem';
import { useTicketDetail } from '@/context/ticket-context';
import { nameInitials } from '@/lib/nameInitials';
import { getTicketPriorityBadgeVariant } from '@/lib/ticketBadgeVariants';
import { ticketStatusLabel } from '@/lib/ticketStatusLabels';
import type { TicketStatus } from '@/types/ticket';
import { useState } from 'react';

export function TicketDetailsPanel() {
  const { ticket } = useTicketDetail();
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  return (
    <ContentPanel title="Ticket Details">
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Ticket ID</dt>
          <dd className="mt-0.5 font-medium text-blue-400">{ticket.code}</dd>
        </div>
        <div>
          <dt className="mb-1.5 text-muted-foreground">Priority</dt>
          <dd>
            <Badge
              variant={getTicketPriorityBadgeVariant(ticket.priority)}
              label={ticket.priority}
            />
          </dd>
        </div>
        <div>
          <dt className="mb-1.5 text-muted-foreground">Status</dt>
          <dd>
            <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus)}>
              <SelectTrigger className="h-9 bg-secondary/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ticketStatusLabel) as TicketStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {ticketStatusLabel[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Assigned To</dt>
          {ticket.assignedUser ? (
            <dd className="mt-1.5">
              <UserItem user={ticket.assignedUser} />
            </dd>
          ) : (
            <dd className="mt-1.5 text-muted-foreground">Unassigned</dd>
          )}
        </div>
        {/* <div>
          <dt className="text-muted-foreground">Linked Incident</dt>
          <dd className="mt-0.5">
            <Link
              href="/incidents"
              className="inline-flex items-center gap-1 font-medium text-blue-400 hover:text-blue-300"
            >
              {ticket.linkedIncident}
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </Link>
          </dd>
        </div> */}
        <div>
          <dt className="text-muted-foreground">Created</dt>
          <dd className="mt-0.5 text-foreground">{ticket.createdAt}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Last Updated</dt>
          <dd className="mt-0.5 text-foreground">{ticket.updatedAt}</dd>
        </div>
      </dl>
    </ContentPanel>
  );
}
