'use client';

import PageTitle from '@/components/layout/PageTitle';
import TicketCard from '@/components/tickets/TicketCard';
import { getTickets } from '@/lib/api';
import { TicketBase } from '@/types/ticket';
import { useCallback, useEffect, useState } from 'react';

const tickets: TicketBase[] = [
  {
    id: 'TKT-1247',
    title: 'Implement rate limiting on auth endpoints',
    severity: 'HIGH',
    status: 'OPEN',
    assignee: 'John Doe',
    // linkedIncident: 'INC-2847',
    createdAt: '2026-04-30 14:35',
    updatedAt: '2026-04-30 14:35',
  },
  {
    id: 'TKT-1248',
    title: 'Review and update firewall rules',
    severity: 'MEDIUM',
    status: 'IN_PROGRESS',
    assignee: 'Sarah Chen',
    // linkedIncident: 'INC-2847',
    createdAt: '2026-04-30 14:40',
    updatedAt: '2026-04-30 14:40',
  },
  {
    id: 'TKT-1246',
    title: 'Deploy endpoint protection update',
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
    assignee: 'Mike Johnson',
    // linkedIncident: 'INC-2846',
    createdAt: '2026-04-30 13:20',
    updatedAt: '2026-04-30 13:20',
  },
  {
    id: 'TKT-1245',
    title: 'Conduct phishing awareness training',
    severity: 'MEDIUM',
    status: 'OPEN',
    assignee: 'Sarah Chen',
    // linkedIncident: 'INC-2845',
    createdAt: '2026-04-30 13:00',
    updatedAt: '2026-04-30 13:00',
  },
  {
    id: 'TKT-1244',
    title: 'Audit database access controls',
    severity: 'HIGH',
    status: 'RESOLVED',
    assignee: 'John Doe',
    // linkedIncident: 'INC-2844',
    createdAt: '2026-04-30 11:45',
    updatedAt: '2026-04-30 11:45',
  },
  {
    id: 'TKT-1243',
    title: 'Update DDoS mitigation rules',
    severity: 'CRITICAL',
    status: 'RESOLVED',
    assignee: 'Mike Johnson',
    // linkedIncident: 'INC-2843',
    createdAt: '2026-04-30 09:30',
    updatedAt: '2026-04-30 09:30',
  },
];

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
          <TicketCard ticket={t} />
        ))}
      </div>
    </>
  );
}
