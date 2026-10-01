import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { deleteIncident, getIncidents, updateIncident } from '@/lib/api';
import { makeIncident } from '@/test-utils/fixtures';
import { chooseOption } from '@/test-utils/select';
import IncidentsPage from './page';

jest.mock('@/lib/api', () => ({
  getIncidents: jest.fn(),
  deleteIncident: jest.fn(),
  createIncident: jest.fn(),
  updateIncident: jest.fn(),
}));

const incidents = [makeIncident(), makeIncident({ id: 'incident-2', code: 'INC-0002', title: 'Malware detected' })];

describe('IncidentsPage', () => {
  beforeEach(() => {
    (getIncidents as jest.Mock).mockReset().mockResolvedValue(incidents);
    (deleteIncident as jest.Mock).mockReset().mockResolvedValue(undefined);
    (updateIncident as jest.Mock).mockReset().mockResolvedValue(incidents[0]);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('loads and lists incidents without filters', async () => {
    render(<IncidentsPage />);
    expect(await screen.findByText('Malware detected')).toBeInTheDocument();
    expect(getIncidents).toHaveBeenCalledWith({ severity: undefined, status: undefined, search: undefined });
  });

  it('refetches when filters change', async () => {
    const user = userEvent.setup();
    render(<IncidentsPage />);
    await screen.findByText('Malware detected');

    const [severity, status] = screen.getAllByRole('combobox');
    await chooseOption(user, severity, 'Critical');
    await waitFor(() =>
      expect(getIncidents).toHaveBeenLastCalledWith({ severity: 'CRITICAL', status: undefined, search: undefined }),
    );

    await chooseOption(user, status, 'Resolved');
    await waitFor(() =>
      expect(getIncidents).toHaveBeenLastCalledWith({ severity: 'CRITICAL', status: 'RESOLVED', search: undefined }),
    );
  });

  it('opens the create form', async () => {
    const user = userEvent.setup();
    render(<IncidentsPage />);
    await user.click(screen.getByRole('button', { name: /Create Incident/ }));
    expect(screen.getByRole('dialog', { name: 'Create Incident' })).toBeInTheDocument();
  });

  it('edits an incident and reloads the list', async () => {
    const user = userEvent.setup();
    render(<IncidentsPage />);
    await screen.findByText('Malware detected');

    await user.click(screen.getAllByTitle('Edit')[0]);
    const dialog = screen.getByRole('dialog', { name: 'Edit Incident' });
    expect(within(dialog).getByLabelText('Title *')).toHaveValue(incidents[0].title);

    await user.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(updateIncident).toHaveBeenCalledWith('incident-1', expect.any(Object));
    expect(getIncidents).toHaveBeenCalledTimes(2);
  });

  it('deletes an incident after confirmation and reloads', async () => {
    const user = userEvent.setup();
    render(<IncidentsPage />);
    await screen.findByText('Malware detected');

    await user.click(screen.getAllByTitle('Delete')[1]);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(getIncidents).toHaveBeenCalledTimes(2));
    expect(deleteIncident).toHaveBeenCalledWith('incident-2');
  });

  it('keeps the list when deleting fails', async () => {
    const user = userEvent.setup();
    (deleteIncident as jest.Mock).mockRejectedValue(new Error('403'));
    render(<IncidentsPage />);
    await screen.findByText('Malware detected');

    await user.click(screen.getAllByTitle('Delete')[0]);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(console.error).toHaveBeenCalledWith('Failed to delete incident:', expect.any(Error)));
    expect(getIncidents).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state when loading fails', async () => {
    (getIncidents as jest.Mock).mockRejectedValue(new Error('500'));
    render(<IncidentsPage />);
    expect(await screen.findByText('No incidents found')).toBeInTheDocument();
  });
});
