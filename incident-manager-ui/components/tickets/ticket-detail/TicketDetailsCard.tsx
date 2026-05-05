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
import { nameInitials } from '@/lib/nameInitials';
import { getTicketSeverityBadgeVariant } from '@/lib/ticketBadgeVariants';
import { ticketStatusLabel } from '@/lib/ticketStatusLabels';
import type { TicketDetailModel, TicketStatus } from '@/types/ticket';

export interface TicketDetailsCardProps {
  ticket: TicketDetailModel;
  status: TicketStatus;
  onStatusChange: (status: TicketStatus) => void;
}

export function TicketDetailsCard({ ticket, status, onStatusChange }: TicketDetailsCardProps) {
  return (
    <ContentPanel title='Ticket Details'>
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Ticket ID</dt>
          <dd className="mt-0.5 font-medium text-blue-400">{ticket.id}</dd>
        </div>
        <div>
          <dt className="mb-1.5 text-muted-foreground">Priority</dt>
          <dd>
            <Badge
              variant={getTicketSeverityBadgeVariant(ticket.severity)}
              label={ticket.severity}
            />
          </dd>
        </div>
        <div>
          <dt className="mb-1.5 text-muted-foreground">Status</dt>
          <dd>
            <Select value={status} onValueChange={(v) => onStatusChange(v as TicketStatus)}>
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
          <dd className="mt-1.5 flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-xs font-medium text-white">
              {nameInitials(ticket.assignee)}
            </span>
            <span className="font-medium text-foreground">{ticket.assignee}</span>
          </dd>
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
