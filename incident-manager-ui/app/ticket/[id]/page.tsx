'use client';

import { TicketActionsCard } from '@/components/tickets/ticket-detail/TicketActionsCard';
import { TicketActivityCard } from '@/components/tickets/ticket-detail/TicketActivityCard';
import { TicketBackLink } from '@/components/tickets/ticket-detail/TicketBackLink';
import { TicketCommentForm } from '@/components/tickets/ticket-detail/TicketCommentForm';
import { TicketDetailsCard } from '@/components/tickets/ticket-detail/TicketDetailsCard';
import { TicketQuickStatsCard } from '@/components/tickets/ticket-detail/TicketQuickStatsCard';
import { TicketSummaryCard } from '@/components/tickets/ticket-detail/TicketSummaryCard';
import type { TicketActivityItem, TicketDetailModel, TicketStatus } from '@/types/ticket';
import { useParams } from 'next/navigation';
import { useState } from 'react';

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

  const [status, setStatus] = useState<TicketStatus>('IN_PROGRESS');

  const ticket: TicketDetailModel = {
    id: ticketId,
    title: 'Implement rate limiting on auth endpoints',
    description:
      'Following the brute force attack incident (INC-2847), we need to implement rate limiting on all authentication endpoints to prevent similar attacks in the future. This should include login, password reset, and API authentication endpoints.',
    assignee: 'John Doe',
    severity: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: '2026-04-30 14:35',
    updatedAt: '2026-05-02 09:15',
  };

  return (
    <div className="space-y-6">
      <TicketBackLink />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 space-y-4 lg:max-w-[320px]">
          <TicketDetailsCard ticket={ticket} status={status} onStatusChange={setStatus} />
          <TicketActionsCard />
          <TicketQuickStatsCard />
          {/* <TicketLinkedIncidentCard ticket={ticket} /> */}
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <TicketSummaryCard ticket={ticket} status={status} />
          <TicketActivityCard items={mockActivity} />
          <TicketCommentForm />
        </div>
      </div>
    </div>
  );
}
