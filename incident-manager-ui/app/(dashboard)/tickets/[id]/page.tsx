'use client';

import { TicketActionsPanel } from '@/components/tickets/ticket-detail/TicketActionsPanel';
import { TicketActivityPanel } from '@/components/tickets/ticket-detail/TicketActivityPanel';
import { TicketBackLink } from '@/components/tickets/ticket-detail/TicketBackLink';
import { TicketCommentForm } from '@/components/tickets/ticket-detail/TicketCommentForm';
import { TicketDetailsPanel } from '@/components/tickets/ticket-detail/TicketDetailsPanel';
import { TicketQuickStatsPanel } from '@/components/tickets/ticket-detail/TicketQuickStatsPanel';
import { TicketSummaryPanel } from '@/components/tickets/ticket-detail/TicketSummaryPanel';
import { TicketDetailProvider } from '@/context/ticket-context';
import { getTicket } from '@/lib/api';
import type { TicketActivityItem, TicketDetailModel, TicketStatus } from '@/types/ticket';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const mockActivity: TicketActivityItem[] = [
  {
    id: 1,
    type: 'status_change',
    user: 'John Doe',
    action: 'Changed status from OPEN to IN_PROGRESS',
    timestamp: '2026-05-01 09:00',
  },
  {
    id: 2,
    type: 'comment',
    user: 'Sarah Chen',
    action: 'Added comment',
    content:
      'I recommend using a sliding window rate limiter. We can start with 5 attempts per minute per IP.',
    timestamp: '2026-05-01 10:30',
  },
  {
    id: 3,
    type: 'comment',
    user: 'John Doe',
    action: 'Added comment',
    content: "Agreed. I've started implementing this using Redis. Should have a PR ready by EOD.",
    timestamp: '2026-05-01 14:22',
  },
  {
    id: 4,
    type: 'comment',
    user: 'Mike Johnson',
    action: 'Added comment',
    content: 'Make sure to whitelist internal IPs and monitoring systems.',
    timestamp: '2026-05-02 08:45',
  },
];

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = typeof params.id === 'string' ? params.id : 'TKT-1247';

  const [loading, setLoading] = useState(true);
  const [ticketDetails, setTicketDetails] = useState<TicketDetailModel | null>(null);

  const fetchTicketDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTicket(ticketId);
      setTicketDetails(data);
    } catch (err) {
      console.error('Failed to fetch ticket details:', err);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicketDetails();
  }, [fetchTicketDetails]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!ticketDetails) {
    return <div>Ticket not found</div>;
  }

  return (
    <TicketDetailProvider ticketId={ticketId} ticket={ticketDetails} refetch={fetchTicketDetails}>
      <div className="space-y-6">
        <TicketBackLink />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 space-y-4 lg:max-w-[320px]">
            <TicketDetailsPanel />
            <TicketActionsPanel />
            <TicketQuickStatsPanel />
            {/* <TicketLinkedIncidentPanel ticket={ticket} /> */}
          </aside>

          <div className="min-w-0 flex-1 space-y-4">
            <TicketSummaryPanel ticket={ticketDetails} />
            <TicketActivityPanel items={mockActivity} />
            <TicketCommentForm />
          </div>
        </div>
      </div>
    </TicketDetailProvider>
  );
}
