import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeAuthUser, makeTicket } from '@/test-utils/fixtures';
import { renderWithTicket } from '@/test-utils/render';
import { TicketActionsPanel } from './TicketActionsPanel';
import { TicketBackLink } from './TicketBackLink';
import { TicketLinkedIncidentPanel } from './TicketLinkedIncidentPanel';

jest.mock('@/lib/api', () => ({
  getAnalysts: jest.fn().mockResolvedValue([]),
  assignTicket: jest.fn(),
  getIncidents: jest.fn().mockResolvedValue([]),
  linkIncident: jest.fn(),
}));

describe('TicketActionsPanel', () => {
  it('shows no actions to client users', async () => {
    renderWithTicket(<TicketActionsPanel />, { user: makeAuthUser('CLIENT_USER') });
    await waitFor(() => expect(screen.getByText('Actions')).toBeInTheDocument());
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('opens the reassign and link dialogs for staff', async () => {
    const user = userEvent.setup();
    renderWithTicket(<TicketActionsPanel />, { user: makeAuthUser('ANALYST') });

    await user.click(await screen.findByRole('button', { name: 'Reassign Ticket' }));
    expect(screen.getByRole('dialog', { name: 'Assign Analyst' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await user.click(screen.getByRole('button', { name: 'Link to Incident' }));
    expect(screen.getByRole('dialog', { name: 'Link to Incident' })).toBeInTheDocument();
  });
});

describe('TicketLinkedIncidentPanel', () => {
  it('shows a placeholder without a linked incident', () => {
    renderWithTicket(<TicketLinkedIncidentPanel />);
    expect(screen.getByText('No incident linked')).toBeInTheDocument();
  });

  it('shows the linked incident', () => {
    renderWithTicket(<TicketLinkedIncidentPanel />, {
      entity: makeTicket({
        incidentId: 'incident-9',
        incident: {
          id: 'incident-9',
          code: 'INC-0009',
          title: 'Phishing campaign',
          severity: 'CRITICAL',
          status: 'OPEN',
          client: 'Acme',
          detectedAt: '2026-03-15T10:00:00.000Z',
        },
      }),
    });
    expect(screen.getByText('Critical')).toBeInTheDocument();
    // NOTE: links to the incidents list rather than to /incidents/incident-9.
    expect(screen.getByRole('link', { name: 'Phishing campaign' })).toHaveAttribute('href', '/incidents');
  });
});

describe('TicketBackLink', () => {
  it('links to the tickets list by default or a custom href', () => {
    const { rerender } = render(<TicketBackLink />);
    expect(screen.getByRole('link', { name: 'Back to tickets' })).toHaveAttribute('href', '/tickets');
    rerender(<TicketBackLink href="/dashboard" />);
    expect(screen.getByRole('link', { name: 'Back to tickets' })).toHaveAttribute('href', '/dashboard');
  });
});
