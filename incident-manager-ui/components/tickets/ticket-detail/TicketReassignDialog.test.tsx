import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assignTicket, getAnalysts } from '@/lib/api';
import { makeAnalyst, makeTicket } from '@/test-utils/fixtures';
import { renderWithTicket } from '@/test-utils/render';
import { chooseOption } from '@/test-utils/select';
import { TicketReassignDialog } from './TicketReassignDialog';

jest.mock('@/lib/api', () => ({ getAnalysts: jest.fn(), assignTicket: jest.fn() }));

describe('TicketReassignDialog', () => {
  beforeEach(() => {
    (getAnalysts as jest.Mock).mockReset().mockResolvedValue([makeAnalyst()]);
    (assignTicket as jest.Mock).mockReset().mockResolvedValue(undefined);
  });

  it('assigns the chosen analyst, refreshes and closes', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    const { refetch, refetchActivities } = renderWithTicket(
      <TicketReassignDialog open onOpenChange={onOpenChange} />,
    );

    await waitFor(() => expect(getAnalysts).toHaveBeenCalled());
    await chooseOption(user, screen.getByRole('combobox'), /Bob Builder/);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(assignTicket).toHaveBeenCalledWith('ticket-1', 'analyst-1');
    expect(refetch).toHaveBeenCalled();
    expect(refetchActivities).toHaveBeenCalled();
  });

  it('clears the assignment when saving with the default selection', async () => {
    const user = userEvent.setup();
    renderWithTicket(<TicketReassignDialog open onOpenChange={jest.fn()} />);
    await waitFor(() => expect(getAnalysts).toHaveBeenCalled());
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(assignTicket).toHaveBeenCalledWith('ticket-1', null));
  });

  it('preselects the current assignee', async () => {
    const user = userEvent.setup();
    renderWithTicket(<TicketReassignDialog open onOpenChange={jest.fn()} />, {
      entity: makeTicket({ assignedUser: makeAnalyst() }),
    });
    await waitFor(() => expect(getAnalysts).toHaveBeenCalled());
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(assignTicket).toHaveBeenCalledWith('ticket-1', 'analyst-1'));
  });

  it('does nothing while closed', () => {
    renderWithTicket(<TicketReassignDialog open={false} onOpenChange={jest.fn()} />);
    expect(getAnalysts).not.toHaveBeenCalled();
  });
});
