'use client';

import PageTitle from '@/components/layout/PageTitle';
import { CreateTicketDialog } from '@/components/tickets/CreateTicketDialog';
import TicketCard from '@/components/tickets/TicketCard';
import { TicketTenantFilter } from '@/components/tickets/TicketTenantFilter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useUserRole } from '@/hooks/useUserRole';
import { getTickets } from '@/lib/api';
import { TicketBase, TicketTenantSummary } from '@/types/ticket';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function TicketsPage() {
  const { isLoading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<TicketBase[]>([]);
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTicket, setShowCreateTicket] = useState(false);

  const { isStaffRole } = useUserRole();

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
    if (!isStaffRole || selectedTenantIds.length === 0) return tickets;
    return tickets.filter((t) => t.tenant && selectedTenantIds.includes(t.tenant.id));
  }, [tickets, isStaffRole, selectedTenantIds]);

  const highlightTenantStripe = isStaffRole && selectedTenantIds.length > 1;

  if (authLoading || loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageTitle
        title="Tickets"
        subtitle="Remediation tasks linked to incidents"
        rightPanel={
          isStaffRole ? (
            <Button className="gap-2" onClick={() => setShowCreateTicket(true)}>
              <Plus className="h-4 w-4" />
              Create Ticket
            </Button>
          ) : undefined
        }
      />
      {isStaffRole && (
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
      <CreateTicketDialog
        open={showCreateTicket}
        onClose={() => setShowCreateTicket(false)}
        onSuccess={fetchTickets}
      />
    </>
  );
}
