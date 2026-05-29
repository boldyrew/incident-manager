'use client';

import { ContentPanel } from '@/components/layout/ContentPanel';
import { useTicketDetail } from '@/context/ticket-context';
import { getTicketQuickStats } from '@/lib/ticketQuickStats';
import type { TicketActivity } from '@/types/ticket-activity';
import { useEffect, useState } from 'react';

export interface TicketQuickStatsPanelProps {
  activities: TicketActivity[];
  loading?: boolean;
}

export function TicketQuickStatsPanel({ activities, loading }: TicketQuickStatsPanelProps) {
  const { ticket } = useTicketDetail();
  const [now, setNow] = useState(() => new Date());

  const isOpen = ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS';

  useEffect(() => {
    if (!isOpen) return;

    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, [isOpen]);

  const stats = getTicketQuickStats(ticket.createdAt, ticket.status, activities, now);

  const rows: [string, string][] = [
    ['Time Open', stats.timeOpen],
    ['Comments', String(stats.comments)],
    ['Status Changes', String(stats.statusChanges)],
  ];

  return (
    <ContentPanel title="Quick Stats">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading stats…</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {rows.map(([label, value]) => (
            <li key={label} className="flex justify-between gap-4">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium tabular-nums text-foreground">{value}</span>
            </li>
          ))}
        </ul>
      )}
    </ContentPanel>
  );
}
