import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createIncident, updateIncident } from '@/lib/api';
import { makeIncident } from '@/test-utils/fixtures';
import { chooseOption } from '@/test-utils/select';
import { IncidentForm } from './IncidentForm';

jest.mock('@/lib/api', () => ({
  createIncident: jest.fn(),
  updateIncident: jest.fn(),
}));

const mockedCreate = createIncident as jest.Mock;
const mockedUpdate = updateIncident as jest.Mock;

function setup(props: Partial<React.ComponentProps<typeof IncidentForm>> = {}) {
  const onClose = jest.fn();
  const onSuccess = jest.fn();
  const utils = render(
    <IncidentForm open incident={null} onClose={onClose} onSuccess={onSuccess} {...props} />,
  );
  return { ...utils, onClose, onSuccess, user: userEvent.setup() };
}

describe('IncidentForm', () => {
  beforeEach(() => {
    jest.useFakeTimers({ advanceTimers: true }).setSystemTime(new Date('2026-03-15T12:00:00.000Z'));
    mockedCreate.mockReset().mockResolvedValue(makeIncident());
    mockedUpdate.mockReset().mockResolvedValue(makeIncident());
  });
  afterEach(() => jest.useRealTimers());

  it('renders nothing when closed', () => {
    setup({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('starts blank in create mode with defaults', () => {
    setup();
    expect(screen.getByRole('dialog', { name: 'Create Incident' })).toBeInTheDocument();
    expect(screen.getByLabelText('Title *')).toHaveValue('');
    expect(screen.getByLabelText('Detected At *')).toHaveValue('2026-03-15T12:00');
    const [severity, status] = screen.getAllByRole('combobox');
    expect(severity).toHaveTextContent('Medium');
    expect(status).toHaveTextContent('Open');
  });

  it('creates an incident with a normalised payload', async () => {
    const { user, onSuccess } = setup();

    await user.type(screen.getByLabelText('Title *'), 'Privilege escalation detected');
    await user.type(screen.getByLabelText('Client *'), 'Acme Corp');
    await chooseOption(user, screen.getAllByRole('combobox')[0], 'Critical');
    await chooseOption(user, screen.getAllByRole('combobox')[1], 'In Progress');
    await user.click(screen.getByRole('button', { name: 'Create Incident' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(mockedCreate).toHaveBeenCalledWith({
      title: 'Privilege escalation detected',
      description: undefined,
      severity: 'CRITICAL',
      status: 'IN_PROGRESS',
      client: 'Acme Corp',
      detectedAt: '2026-03-15T12:00:00.000Z',
    });
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it('pre-fills and updates an existing incident', async () => {
    const incident = makeIncident({ description: undefined });
    const { user, onSuccess } = setup({ incident });

    expect(screen.getByRole('dialog', { name: 'Edit Incident' })).toBeInTheDocument();
    expect(screen.getByLabelText('Title *')).toHaveValue(incident.title);
    expect(screen.getByLabelText('Description')).toHaveValue('');
    expect(screen.getByLabelText('Detected At *')).toHaveValue('2026-03-15T10:30');

    await user.type(screen.getByLabelText('Description'), 'More details');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(mockedUpdate).toHaveBeenCalledWith(
      'incident-1',
      expect.objectContaining({ description: 'More details', detectedAt: incident.detectedAt }),
    );
  });

  it('shows an error and stays open when saving fails', async () => {
    mockedCreate.mockRejectedValue(new Error('500'));
    const { user, onSuccess } = setup();

    await user.type(screen.getByLabelText('Title *'), 'x');
    await user.type(screen.getByLabelText('Client *'), 'y');
    await user.click(screen.getByRole('button', { name: 'Create Incident' }));

    expect(await screen.findByText('Failed to save incident. Please try again.')).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Create Incident' })).toBeEnabled();
  });

  it('shows a saving state while the request is in flight', async () => {
    mockedCreate.mockReturnValue(new Promise(() => {}));
    const { user } = setup();
    await user.type(screen.getByLabelText('Title *'), 'x');
    await user.type(screen.getByLabelText('Client *'), 'y');
    await user.click(screen.getByRole('button', { name: 'Create Incident' }));
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  });

  it('does not submit when required fields are missing', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Create Incident' }));
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it('calls onClose from Cancel', async () => {
    const { user, onClose } = setup();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('resets the form when reopened', async () => {
    const { user, rerender, onClose, onSuccess } = setup();
    await user.type(screen.getByLabelText('Title *'), 'draft');

    rerender(<IncidentForm open={false} incident={null} onClose={onClose} onSuccess={onSuccess} />);
    rerender(<IncidentForm open incident={null} onClose={onClose} onSuccess={onSuccess} />);

    expect(screen.getByLabelText('Title *')).toHaveValue('');
  });
});
