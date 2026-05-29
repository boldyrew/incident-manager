'use client';

import type { Incident } from '@/types/incident';
import { createContext, useContext, type ReactNode } from 'react';

export interface IncidentDetailContextValue {
  incidentId: string;
  incident: Incident;
  refetch: () => Promise<void>;
  refetchActivities: () => Promise<void>;
}

const IncidentDetailContext = createContext<IncidentDetailContextValue | null>(null);

export function IncidentDetailProvider({
  incidentId,
  incident,
  refetch,
  refetchActivities,
  children,
}: {
  incidentId: string;
  incident: Incident;
  refetch: () => Promise<void>;
  refetchActivities: () => Promise<void>;
  children: ReactNode;
}) {
  return (
    <IncidentDetailContext.Provider
      value={{ incidentId, incident, refetch, refetchActivities }}
    >
      {children}
    </IncidentDetailContext.Provider>
  );
}

export function useIncidentDetail() {
  const ctx = useContext(IncidentDetailContext);
  if (!ctx) throw new Error('useIncidentDetail must be used within IncidentDetailProvider');
  return ctx;
}
