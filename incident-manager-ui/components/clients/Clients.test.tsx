import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTenant } from '@/lib/api';
import { makeTenant } from '@/test-utils/fixtures';
import { chooseOption } from '@/test-utils/select';
import { AddClientDialog } from './AddClientDialog';
import { ClientCard } from './ClientCard';
import { ClientsEmptyState } from './ClientsEmptyState';
import { ClientsGrid } from './ClientsGrid';
import { ClientsPageHeader } from './ClientsPageHeader';
import { ClientStatsCards } from './ClientStatsCards';
import { ClientTierBadge } from './ClientTierBadge';

jest.mock('@/lib/api', () => ({ createTenant: jest.fn() }));

describe('ClientTierBadge', () => {
  it.each([
    ['ENTERPRISE', 'Enterprise'],
    ['PROFESSIONAL', 'Professional'],
    ['STARTER', 'Starter'],
  ] as const)('%s -> %s', (tier, label) => {
    render(<ClientTierBadge tier={tier} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe('ClientCard', () => {
  it('shows the tenant and its counters', () => {
    render(<ClientCard tenant={makeTenant()} />);
    expect(screen.getByRole('heading', { name: 'Acme Corp' })).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
    expect(screen.getByText('Open').previousElementSibling).toHaveTextContent('3');
    expect(screen.getByText('Critical').previousElementSibling).toHaveTextContent('1');
    expect(screen.getByText('Resolved').previousElementSibling).toHaveTextContent('5');
    expect(screen.getByText('Active')).toHaveClass('text-emerald-400');
  });

  it('shows defaults for missing industry and inactive tenants', () => {
    render(<ClientCard tenant={makeTenant({ industry: null, status: 'INACTIVE' })} />);
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });
});

describe('ClientsGrid and empty state', () => {
  it('renders a card per tenant', () => {
    render(<ClientsGrid tenants={[makeTenant(), makeTenant({ id: 't2', name: 'Globex' })]} isAdmin={false} />);
    expect(screen.getAllByRole('heading')).toHaveLength(2);
  });

  it('shows the empty state with an admin hint', () => {
    const { rerender } = render(<ClientsGrid tenants={[]} isAdmin />);
    expect(screen.getByText('No clients yet. Add one to get started.')).toBeInTheDocument();
    rerender(<ClientsEmptyState isAdmin={false} />);
    expect(screen.getByText(/No clients yet\./)).not.toHaveTextContent('Add one');
  });
});

describe('ClientsPageHeader', () => {
  it('only shows Add Client to admins', async () => {
    const user = userEvent.setup();
    const onAddClient = jest.fn();
    const { rerender } = render(<ClientsPageHeader isAdmin={false} onAddClient={onAddClient} />);
    expect(screen.queryByRole('button', { name: /Add Client/ })).not.toBeInTheDocument();

    rerender(<ClientsPageHeader isAdmin onAddClient={onAddClient} />);
    await user.click(screen.getByRole('button', { name: /Add Client/ }));
    expect(onAddClient).toHaveBeenCalled();
  });
});

describe('ClientStatsCards', () => {
  it('shows the stats or zeroes', () => {
    const { rerender } = render(
      <ClientStatsCards stats={{ totalClients: 4, openIncidents: 9, criticalIncidents: 2, resolvedThisMonth: 6 }} />,
    );
    expect(screen.getByText('Total Clients').previousElementSibling).toHaveTextContent('4');
    expect(screen.getByText('Resolved This Month').previousElementSibling).toHaveTextContent('6');
    rerender(<ClientStatsCards stats={null} />);
    expect(screen.getAllByText('0')).toHaveLength(4);
  });
});

describe('AddClientDialog', () => {
  function setup() {
    const onClose = jest.fn();
    const onSuccess = jest.fn();
    render(<AddClientDialog open onClose={onClose} onSuccess={onSuccess} />);
    return { onClose, onSuccess, user: userEvent.setup() };
  }

  beforeEach(() => (createTenant as jest.Mock).mockReset().mockResolvedValue(makeTenant()));

  it('slugifies the alias as you type', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText('Alias (unique identifier)'), 'Acme Corp EU');
    expect(screen.getByLabelText('Alias (unique identifier)')).toHaveValue('acme-corp-eu');
  });

  // NOTE: slugifying runs per keystroke, so /\s+/ never sees a run of spaces and each one
  // becomes its own dash (e.g. "a  b" -> "a--b").
  it('turns each typed space into a dash', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText('Alias (unique identifier)'), 'a  b');
    expect(screen.getByLabelText('Alias (unique identifier)')).toHaveValue('a--b');
  });

  it('creates the client and closes', async () => {
    const { user, onClose, onSuccess } = setup();
    await user.type(screen.getByLabelText('Name'), 'Acme Corp');
    await user.type(screen.getByLabelText('Alias (unique identifier)'), 'acme');
    await chooseOption(user, screen.getByRole('combobox'), 'Enterprise');
    await user.click(screen.getByRole('button', { name: 'Create Client' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(createTenant).toHaveBeenCalledWith({
      name: 'Acme Corp',
      alias: 'acme',
      industry: undefined,
      tier: 'ENTERPRISE',
      status: 'ACTIVE',
    });
    expect(onSuccess).toHaveBeenCalled();
  });

  it('sends the industry when provided', async () => {
    const { user, onClose } = setup();
    await user.type(screen.getByLabelText('Name'), 'A');
    await user.type(screen.getByLabelText('Alias (unique identifier)'), 'a');
    await user.type(screen.getByLabelText('Industry'), 'Retail');
    await user.click(screen.getByRole('button', { name: 'Create Client' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect((createTenant as jest.Mock).mock.calls[0][0]).toMatchObject({ industry: 'Retail', tier: 'PROFESSIONAL' });
  });

  it('shows an error when creation fails', async () => {
    (createTenant as jest.Mock).mockRejectedValue(new Error('409'));
    const { user, onClose } = setup();
    await user.type(screen.getByLabelText('Name'), 'A');
    await user.type(screen.getByLabelText('Alias (unique identifier)'), 'a');
    await user.click(screen.getByRole('button', { name: 'Create Client' }));

    expect(
      await screen.findByText('Failed to create client. Check that the alias is unique.'),
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on Cancel', async () => {
    const { user, onClose } = setup();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });
});
