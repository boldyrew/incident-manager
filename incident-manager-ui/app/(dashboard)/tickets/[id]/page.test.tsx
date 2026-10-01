import { screen } from '@testing-library/react';
import { getTicket, getTicketActivities } from '@/lib/api';
import { makeTicket, makeTicketActivity } from '@/test-utils/fixtures';
import { navigationState, resetNavigation } from '@/test-utils/navigation';
import { renderWithAuth } from '@/test-utils/render';
import TicketDetailPage from './page';

jest.mock('next/navigation', () => require('@/test-utils/navigation').navigationMock);
jest.mock('@/lib/api', () => ({
  getTicket: jest.fn(),
  getTicketActivities: jest.fn(),
}));

describe('TicketDetailPage', () => {
  beforeEach(() => {
    resetNavigation();
    navigationState.params = { id: 'ticket-1' };
    (getTicket as jest.Mock).mockReset().mockResolvedValue(makeTicket());
    (getTicketActivities as jest.Mock)
      .mockReset()
      .mockResolvedValue([makeTicketActivity('COMMENT_ADDED', { body: 'Keys rotated' })]);
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('rejects a non-string id', () => {
    navigationState.params = { id: ['a', 'b'] };
    renderWithAuth(<TicketDetailPage />, null);
    expect(screen.getByText('Invalid ticket')).toBeInTheDocument();
  });

  it('shows the ticket with all panels', async () => {
    renderWithAuth(<TicketDetailPage />, null);
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    expect(await screen.findByText('Ticket Details')).toBeInTheDocument();
    expect(getTicket).toHaveBeenCalledWith('ticket-1');
    for (const heading of ['Actions', 'Quick Stats', 'Linked Incident', 'Activity', 'Add Comment']) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    }
    expect(await screen.findByText('Keys rotated')).toBeInTheDocument();
  });

  it('shows not found when loading fails', async () => {
    (getTicket as jest.Mock).mockRejectedValue(new Error('404'));
    renderWithAuth(<TicketDetailPage />, null);
    expect(await screen.findByText('Ticket not found')).toBeInTheDocument();
  });
});
