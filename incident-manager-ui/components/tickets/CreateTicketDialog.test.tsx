import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTicket, getAnalysts, getIncidents, getTenants } from '@/lib/api';
import { makeAnalyst, makeIncident, makeTenant } from '@/test-utils/fixtures';
import { chooseOption } from '@/test-utils/select';
import { CreateTicketDialog } from './CreateTicketDialog';

jest.mock('@/lib/api', () => ({
  createTicket: jest.fn(),
  getAnalysts: jest.fn(),
  getIncidents: jest.fn(),
  getTenants: jest.fn(),
}));

const tenants = [makeTenant({ id: 't2', name: 'Zeta Labs' }), makeTenant({ id: 't1', name: 'Acme Corp' })];

function setup(open = true) {
  const onClose = jest.fn();
  const onSuccess = jest.fn();
  const utils = render(<CreateTicketDialog open={open} onClose={onClose} onSuccess={onSuccess} />);
  const combos = () => screen.getAllByRole('combobox');
  return {
    ...utils,
    onClose,
    onSuccess,
    user: userEvent.setup(),
    priority: () => combos()[0],
    status: () => combos()[1],
    client: () => combos()[2],
    analyst: () => combos()[3],
    incident: () => combos()[4],
  };
}

describe('CreateTicketDialog', () => {
  beforeEach(() => {
    (getTenants as jest.Mock).mockReset().mockResolvedValue(tenants);
    (getAnalysts as jest.Mock).mockReset().mockResolvedValue([makeAnalyst()]);
    (getIncidents as jest.Mock).mockReset().mockResolvedValue([makeIncident()]);
    (createTicket as jest.Mock).mockReset().mockResolvedValue({});
  });

  it('does not load data while closed', () => {
    setup(false);
    expect(getTenants).not.toHaveBeenCalled();
  });

  it('loads clients and analysts when opened, sorted by name', async () => {
    const { user, client } = setup();
    await waitFor(() => expect(getAnalysts).toHaveBeenCalled());

    await user.click(client());
    const options = await screen.findAllByRole('option');
    expect(options.map((o) => o.textContent)).toEqual(['Acme Corp', 'Zeta Labs']);
  });

  it('requires a client before submitting or choosing an incident', async () => {
    const { incident } = setup();
    await waitFor(() => expect(getTenants).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: 'Create Ticket' })).toBeDisabled();
    expect(incident()).toBeDisabled();
    // NOTE: the incident Select's value is never empty (it falls back to NO_INCIDENT_VALUE),
    // so the "Select a client first" / "Loading incidents..." placeholders can never render.
    expect(incident()).not.toHaveTextContent('Select a client first');
  });

  it('loads incidents for the selected client', async () => {
    const { user, client, incident } = setup();
    await waitFor(() => expect(getTenants).toHaveBeenCalled());

    await chooseOption(user, client(), 'Acme Corp');

    await waitFor(() => expect(getIncidents).toHaveBeenCalledWith({ tenantId: 't1' }));
    await waitFor(() => expect(incident()).toBeEnabled());
    expect(incident()).toHaveTextContent('No linked incident');
  });

  it('creates a ticket with all chosen fields', async () => {
    const { user, priority, status, client, analyst, incident, onSuccess, onClose } = setup();
    await waitFor(() => expect(getTenants).toHaveBeenCalled());

    await user.type(screen.getByLabelText('Title *'), 'Rotate keys');
    await user.type(screen.getByLabelText('Description'), 'All prod keys');
    await chooseOption(user, priority(), 'Critical');
    await chooseOption(user, status(), 'In Progress');
    await chooseOption(user, client(), 'Acme Corp');
    await chooseOption(user, analyst(), 'Bob Builder');
    await waitFor(() => expect(incident()).toBeEnabled());
    await chooseOption(user, incident(), /INC-0001/);
    await user.click(screen.getByRole('button', { name: 'Create Ticket' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(createTicket).toHaveBeenCalledWith({
      title: 'Rotate keys',
      description: 'All prod keys',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      tenantId: 't1',
      assignedUserId: 'analyst-1',
      incidentId: 'incident-1',
    });
    expect(onSuccess).toHaveBeenCalled();
  });

  it('sends optional fields as undefined when left empty', async () => {
    const { user, client, onClose } = setup();
    await waitFor(() => expect(getTenants).toHaveBeenCalled());

    await user.type(screen.getByLabelText('Title *'), 'Minimal');
    await chooseOption(user, client(), 'Zeta Labs');
    await user.click(screen.getByRole('button', { name: 'Create Ticket' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(createTicket).toHaveBeenCalledWith({
      title: 'Minimal',
      description: undefined,
      priority: 'MEDIUM',
      status: 'OPEN',
      tenantId: 't2',
      assignedUserId: undefined,
      incidentId: undefined,
    });
  });

  it('resets the linked incident when the client changes', async () => {
    const { user, client, incident, onClose } = setup();
    await waitFor(() => expect(getTenants).toHaveBeenCalled());

    await user.type(screen.getByLabelText('Title *'), 'x');
    await chooseOption(user, client(), 'Acme Corp');
    await waitFor(() => expect(incident()).toBeEnabled());
    await chooseOption(user, incident(), /INC-0001/);
    await chooseOption(user, client(), 'Zeta Labs');
    await user.click(screen.getByRole('button', { name: 'Create Ticket' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect((createTicket as jest.Mock).mock.calls[0][0].incidentId).toBeUndefined();
  });

  it('shows an error when loading clients fails', async () => {
    (getTenants as jest.Mock).mockRejectedValue(new Error('500'));
    setup();
    expect(await screen.findByText('Failed to load clients and analysts.')).toBeInTheDocument();
  });

  it('shows an error when loading incidents fails', async () => {
    (getIncidents as jest.Mock).mockRejectedValue(new Error('500'));
    const { user, client } = setup();
    await waitFor(() => expect(getTenants).toHaveBeenCalled());
    await chooseOption(user, client(), 'Acme Corp');
    expect(await screen.findByText('Failed to load incidents for selected client.')).toBeInTheDocument();
  });

  it('shows an error and stays open when creating fails', async () => {
    (createTicket as jest.Mock).mockRejectedValue(new Error('400'));
    const { user, client, onClose, onSuccess } = setup();
    await waitFor(() => expect(getTenants).toHaveBeenCalled());

    await user.type(screen.getByLabelText('Title *'), 'x');
    await chooseOption(user, client(), 'Acme Corp');
    await user.click(screen.getByRole('button', { name: 'Create Ticket' }));

    expect(
      await screen.findByText('Failed to create ticket. Please check your inputs and try again.'),
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onClose from Cancel', async () => {
    const { user, onClose } = setup();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });
});
