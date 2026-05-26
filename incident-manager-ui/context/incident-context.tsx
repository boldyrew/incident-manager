'use client';

import type { Incident } from '@/types/incident';
import { createContext, useContext, type ReactNode } from 'react';

export interface IncidentDetailContextValue {
  incidentId: string;
  incident: Incident;
  refetch: () => Promise<void>;
}

const IncidentDetailContext = createContext<IncidentDetailContextValue | null>(null);

export function IncidentDetailProvider({
  incidentId,
  incident,
  refetch,
  children,
}: {
  incidentId: string;
  incident: Incident;
  refetch: () => Promise<void>;
  children: ReactNode;
}) {
  return (
    <IncidentDetailContext.Provider value={{ incidentId, incident, refetch }}>
      {children}
    </IncidentDetailContext.Provider>
  );
}

export function useIncidentDetail() {
  const ctx = useContext(IncidentDetailContext);
  if (!ctx) throw new Error('useIncidentDetail must be used within IncidentDetailProvider');
  return ctx;
}
