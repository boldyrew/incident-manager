import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { updateTicketDescription, updateTicketTitle } from '@/lib/api';
import { makeTicket } from '@/test-utils/fixtures';
import { renderWithTicket } from '@/test-utils/render';
import { TicketSummaryPanel } from './TicketSummaryPanel';

jest.mock('@/lib/api', () => ({
  updateTicketTitle: jest.fn().mockResolvedValue(undefined),
  updateTicketDescription: jest.fn().mockResolvedValue(undefined),
}));

describe('TicketSummaryPanel', () => {
  it('shows badges, title and description', () => {
    renderWithTicket(<TicketSummaryPanel />, { entity: makeTicket({ priority: 'LOW', status: 'RESOLVED' }) });
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Title' })).toHaveTextContent('Reset compromised credentials');
    expect(screen.getByRole('button', { name: 'Edit Description' })).toHaveTextContent(
      'Rotate passwords for affected accounts',
    );
  });

  it('shows a placeholder for an empty description', () => {
    renderWithTicket(<TicketSummaryPanel />, { entity: makeTicket({ description: '' }) });
    expect(screen.getByText('Click to add a description…')).toBeInTheDocument();
  });

  it('saves the title and description', async () => {
    const user = userEvent.setup();
    const { refetch, refetchActivities } = renderWithTicket(<TicketSummaryPanel />);

    await user.click(screen.getByRole('button', { name: 'Edit Title' }));
    await user.clear(screen.getByRole('textbox', { name: 'Title' }));
    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'New title{Enter}');
    await waitFor(() => expect(updateTicketTitle).toHaveBeenCalledWith('ticket-1', 'New title'));

    await user.click(screen.getByRole('button', { name: 'Edit Description' }));
    await user.clear(screen.getByRole('textbox', { name: 'Description' }));
    await user.type(screen.getByRole('textbox', { name: 'Description' }), 'New description');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(updateTicketDescription).toHaveBeenCalledWith('ticket-1', 'New description'),
    );

    expect(refetch).toHaveBeenCalledTimes(2);
    expect(refetchActivities).toHaveBeenCalledTimes(2);
  });
});
