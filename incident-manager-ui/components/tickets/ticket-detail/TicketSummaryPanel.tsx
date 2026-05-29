'use client';

import { InlineEditableText, InlineEditableTextarea } from '@/components/editable/InlineEditable';
import { ContentPanel } from '@/components/layout/ContentPanel';
import { Badge } from '@/components/ui/badge';
import { useTicketDetail } from '@/context/ticket-context';
import { updateTicketDescription, updateTicketTitle } from '@/lib/api';
import {
  getTicketPriorityBadgeVariant,
  getTicketStatusBadgeVariant,
} from '@/lib/ticketBadgeVariants';
import { ticketStatusLabel } from '@/lib/ticketStatusLabels';
import { useCallback } from 'react';

export function TicketSummaryPanel() {
  const { ticketId, ticket, refetch, refetchActivities } = useTicketDetail();

  const saveTitle = useCallback(
    async (title: string) => {
      await updateTicketTitle(ticketId, title);
      await Promise.all([refetch(), refetchActivities()]);
    },
    [ticketId, refetch, refetchActivities],
  );

  const saveDescription = useCallback(
    async (description: string) => {
      await updateTicketDescription(ticketId, description);
      await Promise.all([refetch(), refetchActivities()]);
    },
    [ticketId, refetch, refetchActivities],
  );

  return (
    <ContentPanel>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant={getTicketPriorityBadgeVariant(ticket.priority)} label={ticket.priority} />
        <Badge
          variant={getTicketStatusBadgeVariant(ticket.status)}
          label={ticketStatusLabel[ticket.status] || ticket.status}
        />
      </div>
      <InlineEditableText
        value={ticket.title}
        onSave={saveTitle}
        label="Title"
        placeholder="Ticket title"
        displayClassName="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
      />
      <div className="mt-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Description
        </p>
        <InlineEditableTextarea
          value={ticket.description ?? ''}
          onSave={saveDescription}
          label="Description"
          placeholder="Add a description…"
          emptyText="Click to add a description…"
        />
      </div>
    </ContentPanel>
  );
}
