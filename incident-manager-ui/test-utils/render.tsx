import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { AuthProvider, type AuthUser } from '@/context/auth-context';
import { IncidentDetailProvider } from '@/context/incident-context';
import { TicketDetailProvider } from '@/context/ticket-context';
import type { Incident } from '@/types/incident';
import type { TicketDetailModel } from '@/types/ticket';
import { makeIncident, makeTicket } from './fixtures';

/** Seeds localStorage the way AuthProvider reads it on mount. */
export function seedAuth(user: AuthUser | null, token = 'test-token') {
  if (!user) return;
  localStorage.setItem('access_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
}

export function renderWithAuth(ui: ReactElement, user: AuthUser | null, options?: RenderOptions) {
  seedAuth(user);
  return render(ui, { wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>, ...options });
}

interface DetailOptions<T> {
  user?: AuthUser | null;
  entity?: T;
  refetch?: jest.Mock;
  refetchActivities?: jest.Mock;
}

export function renderWithIncident(
  ui: ReactElement,
  {
    user = null,
    entity = makeIncident(),
    refetch = jest.fn().mockResolvedValue(undefined),
    refetchActivities = jest.fn().mockResolvedValue(undefined),
  }: DetailOptions<Incident> = {},
) {
  seedAuth(user);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>
      <IncidentDetailProvider
        incidentId={entity.id}
        incident={entity}
        refetch={refetch}
        refetchActivities={refetchActivities}
      >
        {children}
      </IncidentDetailProvider>
    </AuthProvider>
  );
  return { ...render(ui, { wrapper }), refetch, refetchActivities, incident: entity };
}

export function renderWithTicket(
  ui: ReactElement,
  {
    user = null,
    entity = makeTicket(),
    refetch = jest.fn().mockResolvedValue(undefined),
    refetchActivities = jest.fn().mockResolvedValue(undefined),
  }: DetailOptions<TicketDetailModel> = {},
) {
  seedAuth(user);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>
      <TicketDetailProvider
        ticketId={entity.id}
        ticket={entity}
        refetch={refetch}
        refetchActivities={refetchActivities}
      >
        {children}
      </TicketDetailProvider>
    </AuthProvider>
  );
  return { ...render(ui, { wrapper }), refetch, refetchActivities, ticket: entity };
}
