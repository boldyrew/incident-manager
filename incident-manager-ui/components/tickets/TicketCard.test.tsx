import { screen, waitFor } from '@testing-library/react';
import { makeAuthUser, makeTicketBase, TENANT } from '@/test-utils/fixtures';
import { renderWithAuth } from '@/test-utils/render';
import TicketCard from './TicketCard';

describe('TicketCard', () => {
  it('shows code, badges, title link and created date', () => {
    renderWithAuth(<TicketCard ticket={makeTicketBase({ status: 'IN_PROGRESS' })} />, null);

    expect(screen.getByText('TKT-0001')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Reset compromised credentials' })).toHaveAttribute(
      'href',
      '/tickets/ticket-1',
    );
    expect(screen.getByText('15 Mar 2026, 10:00:00')).toBeInTheDocument();
  });

  it('shows placeholders when unassigned and unlinked', () => {
    renderWithAuth(<TicketCard ticket={makeTicketBase()} />, null);
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('shows the assignee and links the incident', () => {
    renderWithAuth(
      <TicketCard
        ticket={makeTicketBase({
          assignedUser: { id: 'u1', fullName: 'Bob Builder', email: 'bob@x.io' },
          incident: {
            id: 'incident-9',
            code: 'INC-0009',
            title: 'Phishing campaign',
            severity: 'HIGH',
            status: 'OPEN',
            client: 'Acme',
            detectedAt: '2026-03-15T10:00:00.000Z',
          },
        })}
      />,
      null,
    );
    expect(screen.getByText('Bob Builder')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'INC-0009' });
    expect(link).toHaveAttribute('href', '/incidents/incident-9');
    expect(link).toHaveAttribute('title', 'INC-0009 — Phishing campaign');
  });

  it('hides the tenant stripe from client users', async () => {
    renderWithAuth(<TicketCard ticket={makeTicketBase()} />, makeAuthUser('CLIENT_USER'));
    await waitFor(() => expect(screen.queryByTitle(TENANT.name)).not.toBeInTheDocument());
  });

  it('shows a neutral tenant stripe to staff by default', async () => {
    renderWithAuth(<TicketCard ticket={makeTicketBase()} />, makeAuthUser('ADMIN'));
    expect(await screen.findByTitle(TENANT.name)).toHaveClass('text-muted-foreground');
  });

  it('highlights the stripe by tenant match when requested', async () => {
    const { unmount } = renderWithAuth(
      <TicketCard ticket={makeTicketBase()} highlightTenantStripe />,
      makeAuthUser('ANALYST', { tenantId: TENANT.id }),
    );
    expect(await screen.findByTitle(TENANT.name)).toHaveClass('text-emerald-100');
    unmount();

    renderWithAuth(
      <TicketCard ticket={makeTicketBase()} highlightTenantStripe />,
      makeAuthUser('ANALYST', { tenantId: 'other' }),
    );
    expect(await screen.findByTitle(TENANT.name)).toHaveClass('text-sky-100');
  });

  it('omits the stripe for tickets without a tenant', async () => {
    renderWithAuth(<TicketCard ticket={makeTicketBase({ tenant: null })} />, makeAuthUser('ADMIN'));
    await waitFor(() => expect(screen.queryByTitle(TENANT.name)).not.toBeInTheDocument());
  });
});
