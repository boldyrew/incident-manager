'use client';

import type { TicketDetailModel } from '@/types/ticket';
import { createContext, useContext, type ReactNode } from 'react';

export interface TicketDetailContextValue {
  ticketId: string;
  ticket: TicketDetailModel;
  refetch: () => Promise<void>;
}

const TicketDetailContext = createContext<TicketDetailContextValue | null>(null);

export function TicketDetailProvider({
  ticketId,
  ticket,
  refetch,
  children,
}: {
  ticketId: string;
  ticket: TicketDetailModel;
  refetch: () => Promise<void>;
  children: ReactNode;
}) {
  return (
    <TicketDetailContext.Provider value={{ ticketId, ticket, refetch }}>
      {children}
    </TicketDetailContext.Provider>
  );
}

export function useTicketDetail() {
  const ctx = useContext(TicketDetailContext);
  if (!ctx) throw new Error('useTicketDetail must be used within TicketDetailProvider');
  return ctx;
}

/** Convenience for nested components that only need the route / API ticket id. */
export function useTicketId() {
  return useTicketDetail().ticketId;
}
