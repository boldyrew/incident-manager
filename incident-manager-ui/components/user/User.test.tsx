import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeAnalyst } from '@/test-utils/fixtures';
import { chooseOption } from '@/test-utils/select';
import { UserAvatar } from './UserAvatar';
import { UserItem } from './UserItem';
import { USER_SELECT_UNASSIGNED, UserSelect } from './UserSelect';

describe('UserAvatar', () => {
  it('shows initials and size variants', () => {
    const { container, rerender } = render(<UserAvatar name="Bob Builder" />);
    expect(screen.getByText('BB')).toHaveClass('h-9');
    rerender(<UserAvatar name="Bob Builder" type="compact" />);
    expect(screen.getByText('BB')).toHaveClass('h-5');
    expect(container.firstChild).toHaveAttribute('aria-hidden');
  });
});

describe('UserItem', () => {
  const user = makeAnalyst();

  it('shows name and email in full mode', () => {
    render(<UserItem user={user} />);
    expect(screen.getByText('Bob Builder')).toBeInTheDocument();
    expect(screen.getByText('bob@secureops.io')).toBeInTheDocument();
  });

  it('hides the email in compact mode', () => {
    render(<UserItem user={user} type="compact" />);
    expect(screen.getByText('Bob Builder')).toBeInTheDocument();
    expect(screen.queryByText('bob@secureops.io')).not.toBeInTheDocument();
  });
});

describe('UserSelect', () => {
  const users = [makeAnalyst(), makeAnalyst({ id: 'analyst-2', fullName: 'Carol Danvers' })];

  it('shows the placeholder without a value', () => {
    render(<UserSelect users={users} value={undefined} onValueChange={jest.fn()} />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Select a team member');
  });

  it('lists users and reports the selection', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(<UserSelect users={users} value={undefined} onValueChange={onValueChange} />);

    await chooseOption(user, screen.getByRole('combobox'), /Carol Danvers/);

    expect(onValueChange).toHaveBeenCalledWith('analyst-2');
  });

  it('offers an Unassigned option only when allowed', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    const { rerender } = render(<UserSelect users={users} value={undefined} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('option', { name: /Unassigned/ })).not.toBeInTheDocument();
    await user.keyboard('{Escape}');

    rerender(<UserSelect users={users} value={undefined} onValueChange={onValueChange} allowUnassigned />);
    await chooseOption(user, screen.getByRole('combobox'), /Unassigned/);
    expect(onValueChange).toHaveBeenCalledWith(USER_SELECT_UNASSIGNED);
  });
});
