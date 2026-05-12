'use client';

import PageTitle from '@/components/layout/PageTitle';
import TicketCard from '@/components/tickets/TicketCard';
import { getTickets } from '@/lib/api';
import { TicketBase } from '@/types/ticket';
import { useCallback, useEffect, useState } from 'react';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketBase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageTitle title="Tickets" subtitle="Remediation tasks linked to incidents" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((t) => (
          <TicketCard key={t.code} ticket={t} />
        ))}
      </div>
    </>
  );
}
