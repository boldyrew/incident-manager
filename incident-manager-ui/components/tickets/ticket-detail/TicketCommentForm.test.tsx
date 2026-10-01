import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addTicketComment } from '@/lib/api';
import { renderWithTicket } from '@/test-utils/render';
import { TicketCommentForm } from './TicketCommentForm';

jest.mock('@/lib/api', () => ({ addTicketComment: jest.fn() }));

const mockedAdd = addTicketComment as jest.Mock;

describe('TicketCommentForm', () => {
  beforeEach(() => {
    mockedAdd.mockReset().mockResolvedValue(undefined);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('posts the trimmed comment and refreshes', async () => {
    const user = userEvent.setup();
    const { refetchActivities } = renderWithTicket(<TicketCommentForm />);

    expect(screen.getByRole('button', { name: 'Send comment' })).toBeDisabled();
    await user.type(screen.getByPlaceholderText('Write a comment...'), ' Done ');
    await user.click(screen.getByRole('button', { name: 'Send comment' }));

    await waitFor(() => expect(refetchActivities).toHaveBeenCalled());
    expect(mockedAdd).toHaveBeenCalledWith('ticket-1', 'Done');
    expect(screen.getByPlaceholderText('Write a comment...')).toHaveValue('');
  });

  it('shows an error when posting fails', async () => {
    const user = userEvent.setup();
    mockedAdd.mockRejectedValue(new Error('500'));
    renderWithTicket(<TicketCommentForm />);

    await user.type(screen.getByPlaceholderText('Write a comment...'), 'note');
    await user.click(screen.getByRole('button', { name: 'Send comment' }));

    expect(await screen.findByText('Failed to post comment. Please try again.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write a comment...')).toHaveValue('note');
  });
});
