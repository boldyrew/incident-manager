import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addIncidentComment } from '@/lib/api';
import { renderWithIncident } from '@/test-utils/render';
import { IncidentCommentForm } from './IncidentCommentForm';

jest.mock('@/lib/api', () => ({ addIncidentComment: jest.fn() }));

const mockedAdd = addIncidentComment as jest.Mock;

describe('IncidentCommentForm', () => {
  beforeEach(() => {
    mockedAdd.mockReset().mockResolvedValue(undefined);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('disables sending until there is non-blank text', async () => {
    const user = userEvent.setup();
    renderWithIncident(<IncidentCommentForm />);
    const send = screen.getByRole('button', { name: 'Send comment' });

    expect(send).toBeDisabled();
    await user.type(screen.getByPlaceholderText('Write a comment...'), '   ');
    expect(send).toBeDisabled();
    await user.type(screen.getByPlaceholderText('Write a comment...'), 'x');
    expect(send).toBeEnabled();
  });

  it('posts the trimmed comment, clears the box and refreshes the activity', async () => {
    const user = userEvent.setup();
    const { refetchActivities } = renderWithIncident(<IncidentCommentForm />);

    await user.type(screen.getByPlaceholderText('Write a comment...'), '  Investigating  ');
    await user.click(screen.getByRole('button', { name: 'Send comment' }));

    await waitFor(() => expect(refetchActivities).toHaveBeenCalled());
    expect(mockedAdd).toHaveBeenCalledWith('incident-1', 'Investigating');
    expect(screen.getByPlaceholderText('Write a comment...')).toHaveValue('');
  });

  it('keeps the text and shows an error when posting fails', async () => {
    const user = userEvent.setup();
    mockedAdd.mockRejectedValue(new Error('500'));
    const { refetchActivities } = renderWithIncident(<IncidentCommentForm />);

    await user.type(screen.getByPlaceholderText('Write a comment...'), 'note');
    await user.click(screen.getByRole('button', { name: 'Send comment' }));

    expect(await screen.findByText('Failed to post comment. Please try again.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write a comment...')).toHaveValue('note');
    expect(refetchActivities).not.toHaveBeenCalled();
  });

  it('locks the form while submitting', async () => {
    const user = userEvent.setup();
    mockedAdd.mockReturnValue(new Promise(() => {}));
    renderWithIncident(<IncidentCommentForm />);

    await user.type(screen.getByPlaceholderText('Write a comment...'), 'note');
    await user.click(screen.getByRole('button', { name: 'Send comment' }));

    expect(screen.getByPlaceholderText('Write a comment...')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send comment' })).toBeDisabled();
  });
});
