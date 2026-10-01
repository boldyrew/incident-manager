import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getAnalysts, getTenants, getTickets } from '@/lib/api';
import { makeAuthUser, makeTicketBase } from '@/test-utils/fixtures';
import { renderWithAuth } from '@/test-utils/render';
import TicketsPage from './page';

jest.mock('@/lib/api', () => ({
  getTickets: jest.fn(),
  getTenants: jest.fn().mockResolvedValue([]),
  getAnalysts: jest.fn().mockResolvedValue([]),
  getIncidents: jest.fn().mockResolvedValue([]),
  createTicket: jest.fn(),
}));

const globex = { id: 'tenant-2', name: 'Globex', alias: 'globex' };
const tickets = [
  makeTicketBase(),
  makeTicketBase({ id: 'ticket-2', code: 'TKT-0002', title: 'Patch VPN', tenant: globex }),
  makeTicketBase({ id: 'ticket-3', code: 'TKT-0003', title: 'Orphan ticket', tenant: null }),
];

// The tenant name appears as a title on both the filter label and the card stripe.
const stripe = (name: string) =>
  screen.getAllByTitle(name).find((el) => el.tagName === 'DIV') as HTMLElement;

const visibleCodes = () => screen.queryAllByText(/^TKT-/).map((el) => el.textContent);

describe('TicketsPage', () => {
  beforeEach(() => {
    (getTickets as jest.Mock).mockReset().mockResolvedValue(tickets);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('shows a loading state, then every ticket', async () => {
    renderWithAuth(<TicketsPage />, makeAuthUser('ANALYST'));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => expect(visibleCodes()).toEqual(['TKT-0001', 'TKT-0002', 'TKT-0003']));
  });

  it('hides the create button and tenant filter from client users', async () => {
    renderWithAuth(<TicketsPage />, makeAuthUser('CLIENT_USER'));
    await waitFor(() => expect(visibleCodes()).toHaveLength(3));
    expect(screen.queryByRole('button', { name: /Create Ticket/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/^Tenants:/)).not.toBeInTheDocument();
  });

  it('builds a sorted tenant filter from the tickets and filters by it', async () => {
    const user = userEvent.setup();
    renderWithAuth(<TicketsPage />, makeAuthUser('ADMIN'));
    await waitFor(() => expect(visibleCodes()).toHaveLength(3));

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.map((c) => c.closest('label')!.textContent)).toEqual(['Acme Corp(acme)', 'Globex(globex)']);

    await user.click(screen.getByRole('checkbox', { name: /Globex/ }));
    expect(visibleCodes()).toEqual(['TKT-0002']);
    // a single tenant selection keeps the neutral stripe
    expect(stripe('Globex')).toHaveClass('text-muted-foreground');

    await user.click(screen.getByRole('checkbox', { name: /Acme Corp/ }));
    expect(visibleCodes()).toEqual(['TKT-0001', 'TKT-0002']);
    // multiple tenants highlight the stripes
    expect(stripe('Globex')).not.toHaveClass('text-muted-foreground');
  });

  it('opens the create dialog and reloads after creating', async () => {
    const user = userEvent.setup();
    renderWithAuth(<TicketsPage />, makeAuthUser('ANALYST'));
    await user.click(await screen.findByRole('button', { name: /Create Ticket/ }));

    const dialog = screen.getByRole('dialog', { name: 'Create Ticket' });
    await waitFor(() => expect(getTenants).toHaveBeenCalled());
    expect(getAnalysts).toHaveBeenCalled();
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders an empty grid when loading fails', async () => {
    (getTickets as jest.Mock).mockRejectedValue(new Error('500'));
    renderWithAuth(<TicketsPage />, makeAuthUser('ANALYST'));
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    expect(visibleCodes()).toEqual([]);
  });
});
