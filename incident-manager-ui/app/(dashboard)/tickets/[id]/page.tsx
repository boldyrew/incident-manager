'use client';

import { TicketActionsPanel } from '@/components/tickets/ticket-detail/TicketActionsPanel';
import { TicketActivityPanel } from '@/components/tickets/ticket-detail/TicketActivityPanel';
import { TicketBackLink } from '@/components/tickets/ticket-detail/TicketBackLink';
import { TicketCommentForm } from '@/components/tickets/ticket-detail/TicketCommentForm';
import { TicketDetailsPanel } from '@/components/tickets/ticket-detail/TicketDetailsPanel';
import { TicketLinkedIncidentPanel } from '@/components/tickets/ticket-detail/TicketLinkedIncidentPanel';
import { TicketQuickStatsPanel } from '@/components/tickets/ticket-detail/TicketQuickStatsPanel';
import { TicketSummaryPanel } from '@/components/tickets/ticket-detail/TicketSummaryPanel';
import { TicketDetailProvider } from '@/context/ticket-context';
import { useTicketActivities } from '@/hooks/useTicketActivities';
import { getTicket } from '@/lib/api';
import type { TicketDetailModel } from '@/types/ticket';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = typeof params.id === 'string' ? params.id : '';

  const [loading, setLoading] = useState(true);
  const [ticketDetails, setTicketDetails] = useState<TicketDetailModel | null>(null);

  const {
    activities,
    loading: activitiesLoading,
    error: activitiesError,
    refetch: refetchActivities,
  } = useTicketActivities(ticketId || undefined);

  const fetchTicketDetails = useCallback(async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      const data = await getTicket(ticketId);
      setTicketDetails(data);
    } catch (err) {
      console.error('Failed to fetch ticket details:', err);
      setTicketDetails(null);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicketDetails();
  }, [fetchTicketDetails]);

  if (!ticketId) {
    return <div>Invalid ticket</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!ticketDetails) {
    return <div>Ticket not found</div>;
  }

  return (
    <TicketDetailProvider
      ticketId={ticketId}
      ticket={ticketDetails}
      refetch={fetchTicketDetails}
      refetchActivities={refetchActivities}
    >
      <div className="space-y-6">
        <TicketBackLink />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 space-y-4 lg:max-w-[320px]">
            <TicketDetailsPanel />
            <TicketActionsPanel />
            <TicketQuickStatsPanel />
            <TicketLinkedIncidentPanel />
          </aside>

          <div className="min-w-0 flex-1 space-y-4">
            <TicketSummaryPanel />
            <TicketActivityPanel
              activities={activities}
              loading={activitiesLoading}
              error={activitiesError}
            />
            <TicketCommentForm />
          </div>
        </div>
      </div>
    </TicketDetailProvider>
  );
}
