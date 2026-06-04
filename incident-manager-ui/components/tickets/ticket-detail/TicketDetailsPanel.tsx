'use client';

import { InlineEditableBadgeSelect } from '@/components/editable/InlineEditable';
import { ContentPanel } from '@/components/layout/ContentPanel';
import { UserItem } from '@/components/user/UserItem';
import { useTicketDetail } from '@/context/ticket-context';
import { useFormatDateTime } from '@/hooks/useFormatDateTime';
import { updateTicketPriority, updateTicketStatus } from '@/lib/api';
import {
  getTicketPriorityBadgeVariant,
  getTicketStatusBadgeVariant,
} from '@/lib/ticketBadgeVariants';
import { ticketPriorityLabel } from '@/lib/ticketPriorityLabels';
import { ticketStatusLabel } from '@/lib/ticketStatusLabels';
import type { TicketPriority, TicketStatus } from '@/types/ticket';
import { useCallback } from 'react';

const priorityOptions = (Object.keys(ticketPriorityLabel) as TicketPriority[]).map((value) => ({
  value,
  label: ticketPriorityLabel[value],
}));

const statusOptions = (Object.keys(ticketStatusLabel) as TicketStatus[]).map((value) => ({
  value,
  label: ticketStatusLabel[value],
}));

export function TicketDetailsPanel() {
  const { ticketId, ticket, refetch, refetchActivities } = useTicketDetail();
  const { formatDateTime } = useFormatDateTime();

  const savePriority = useCallback(
    async (priority: TicketPriority) => {
      await updateTicketPriority(ticketId, priority);
      await Promise.all([refetch(), refetchActivities()]);
    },
    [ticketId, refetch, refetchActivities],
  );

  const saveStatus = useCallback(
    async (status: TicketStatus) => {
      await updateTicketStatus(ticketId, status);
      await Promise.all([refetch(), refetchActivities()]);
    },
    [ticketId, refetch, refetchActivities],
  );

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
            <InlineEditableBadgeSelect
              value={ticket.priority}
              options={priorityOptions}
              onSave={savePriority}
              getBadgeVariant={getTicketPriorityBadgeVariant}
              label="Priority"
              className="w-full"
            />
          </dd>
        </div>
        <div>
          <dt className="mb-1.5 text-muted-foreground">Status</dt>
          <dd>
            <InlineEditableBadgeSelect
              value={ticket.status}
              options={statusOptions}
              onSave={saveStatus}
              getBadgeVariant={getTicketStatusBadgeVariant}
              label="Status"
              className="w-full"
            />
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
        <div>
          <dt className="text-muted-foreground">Created</dt>
          <dd className="mt-0.5 text-foreground">{formatDateTime(ticket.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Last Updated</dt>
          <dd className="mt-0.5 text-foreground">{formatDateTime(ticket.updatedAt)}</dd>
        </div>
      </dl>
    </ContentPanel>
  );
}
