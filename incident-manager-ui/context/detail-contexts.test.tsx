import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { makeIncident, makeTicket } from '@/test-utils/fixtures';
import { IncidentDetailProvider, useIncidentDetail } from './incident-context';
import { TicketDetailProvider, useTicketDetail, useTicketId } from './ticket-context';

describe('detail contexts', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  it('IncidentDetailProvider exposes its values', () => {
    const incident = makeIncident();
    const refetch = jest.fn();
    const refetchActivities = jest.fn();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <IncidentDetailProvider
        incidentId="incident-1"
        incident={incident}
        refetch={refetch}
        refetchActivities={refetchActivities}
      >
        {children}
      </IncidentDetailProvider>
    );

    const { result } = renderHook(() => useIncidentDetail(), { wrapper });

    expect(result.current).toEqual({ incidentId: 'incident-1', incident, refetch, refetchActivities });
  });

  it('TicketDetailProvider exposes its values and the ticket id', () => {
    const ticket = makeTicket();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TicketDetailProvider ticketId="ticket-1" ticket={ticket} refetch={jest.fn()} refetchActivities={jest.fn()}>
        {children}
      </TicketDetailProvider>
    );

    expect(renderHook(() => useTicketDetail(), { wrapper }).result.current.ticket).toBe(ticket);
    expect(renderHook(() => useTicketId(), { wrapper }).result.current).toBe('ticket-1');
  });

  it('hooks throw outside their providers', () => {
    expect(() => renderHook(() => useIncidentDetail())).toThrow(
      'useIncidentDetail must be used within IncidentDetailProvider',
    );
    expect(() => renderHook(() => useTicketDetail())).toThrow(
      'useTicketDetail must be used within TicketDetailProvider',
    );
  });
});
