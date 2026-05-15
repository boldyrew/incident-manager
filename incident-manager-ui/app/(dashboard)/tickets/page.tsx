'use client';

import PageTitle from '@/components/layout/PageTitle';
import TicketCard from '@/components/tickets/TicketCard';
import { TicketTenantFilter } from '@/components/tickets/TicketTenantFilter';
import { useAuth } from '@/context/auth-context';
import { getTickets } from '@/lib/api';
import { TicketBase, TicketTenantSummary } from '@/types/ticket';
import { useCallback, useEffect, useMemo, useState } from 'react';

function isStaffRole(role: string | undefined): boolean {
  return role === 'ADMIN' || role === 'ANALYST';
}

export default function TicketsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<TicketBase[]>([]);
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const staff = isStaffRole(user?.role);

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
    if (authLoading) return;
    fetchTickets();
  }, [authLoading, fetchTickets]);

  const tenants = useMemo((): TicketTenantSummary[] => {
    const byId = new Map<string, TicketTenantSummary>();
    for (const t of tickets) {
      if (t.tenant) byId.set(t.tenant.id, t.tenant);
    }
    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [tickets]);

  const visibleTickets = useMemo(() => {
    if (!staff || selectedTenantIds.length === 0) return tickets;
    return tickets.filter((t) => t.tenant && selectedTenantIds.includes(t.tenant.id));
  }, [tickets, staff, selectedTenantIds]);

  const highlightTenantStripe = staff && selectedTenantIds.length > 1;

  if (authLoading || loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageTitle title="Tickets" subtitle="Remediation tasks linked to incidents" />
      {staff && (
        <TicketTenantFilter
          tenants={tenants}
          selectedIds={selectedTenantIds}
          onChange={setSelectedTenantIds}
        />
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleTickets.map((t) => (
          <TicketCard key={t.id} ticket={t} highlightTenantStripe={highlightTenantStripe} />
        ))}
      </div>
    </>
  );
}
