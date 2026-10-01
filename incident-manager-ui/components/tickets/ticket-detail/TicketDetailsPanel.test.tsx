import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { updateTicketPriority, updateTicketStatus } from '@/lib/api';
import { makeAuthUser, makeTicket } from '@/test-utils/fixtures';
import { renderWithTicket } from '@/test-utils/render';
import { chooseOption } from '@/test-utils/select';
import { TicketDetailsPanel } from './TicketDetailsPanel';

jest.mock('@/lib/api', () => ({
  updateTicketPriority: jest.fn().mockResolvedValue(undefined),
  updateTicketStatus: jest.fn().mockResolvedValue(undefined),
}));

describe('TicketDetailsPanel', () => {
  it('shows the ticket details', () => {
    renderWithTicket(<TicketDetailsPanel />, {
      entity: makeTicket({ assignedUser: { id: 'u1', fullName: 'Bob Builder', email: 'bob@x.io' } }),
    });
    expect(screen.getByText('TKT-0001')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Priority' })).toHaveTextContent('High');
    expect(screen.getByRole('button', { name: 'Edit Status' })).toHaveTextContent('Open');
    expect(screen.getByText('Bob Builder')).toBeInTheDocument();
    expect(screen.getByText('15 Mar 2026, 10:00')).toBeInTheDocument();
    expect(screen.getByText('15 Mar 2026, 11:00')).toBeInTheDocument();
  });

  it('shows Unassigned when nobody is assigned', () => {
    renderWithTicket(<TicketDetailsPanel />);
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  // NOTE: unlike IncidentDetailsPanel, priority/status stay editable for client users,
  // although the API restricts these endpoints to ADMIN/ANALYST (they would get a 403).
  it('stays editable for client users', async () => {
    renderWithTicket(<TicketDetailsPanel />, { user: makeAuthUser('CLIENT_USER') });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit Priority' })).toBeEnabled());
    expect(screen.getByRole('button', { name: 'Edit Status' })).toBeEnabled();
  });

  it('saves priority and status changes and refreshes', async () => {
    const user = userEvent.setup();
    const { refetch, refetchActivities } = renderWithTicket(<TicketDetailsPanel />);

    await user.click(screen.getByRole('button', { name: 'Edit Priority' }));
    await chooseOption(user, screen.getByRole('combobox', { name: 'Priority' }), 'Low');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(updateTicketPriority).toHaveBeenCalledWith('ticket-1', 'LOW'));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit Status' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Edit Status' }));
    await chooseOption(user, screen.getByRole('combobox', { name: 'Status' }), 'Closed');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(updateTicketStatus).toHaveBeenCalledWith('ticket-1', 'CLOSED'));

    expect(refetch).toHaveBeenCalledTimes(2);
    expect(refetchActivities).toHaveBeenCalledTimes(2);
  });
});
