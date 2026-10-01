import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { updateIncidentSeverity, updateIncidentStatus } from '@/lib/api';
import { makeAuthUser, makeIncident } from '@/test-utils/fixtures';
import { renderWithIncident } from '@/test-utils/render';
import { chooseOption } from '@/test-utils/select';
import { IncidentDetailsPanel } from './IncidentDetailsPanel';

jest.mock('@/lib/api', () => ({
  updateIncidentSeverity: jest.fn().mockResolvedValue(undefined),
  updateIncidentStatus: jest.fn().mockResolvedValue(undefined),
}));

describe('IncidentDetailsPanel', () => {
  it('shows the incident details', () => {
    renderWithIncident(<IncidentDetailsPanel />, {
      entity: makeIncident({
        assignedUser: { id: 'u1', fullName: 'Bob Builder', email: 'bob@secureops.io' },
      }),
    });

    expect(screen.getByText('INC-0001')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Severity' })).toHaveTextContent('High');
    expect(screen.getByRole('button', { name: 'Edit Status' })).toHaveTextContent('Open');
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Bob Builder')).toBeInTheDocument();
    expect(screen.getByText('bob@secureops.io')).toBeInTheDocument();
    expect(screen.getByText('15 Mar 2026, 10:30')).toBeInTheDocument();
  });

  it('shows Unassigned when nobody is assigned', () => {
    renderWithIncident(<IncidentDetailsPanel />);
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('is read-only for client users', async () => {
    renderWithIncident(<IncidentDetailsPanel />, { user: makeAuthUser('CLIENT_USER') });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit Severity' })).toBeDisabled());
    expect(screen.getByRole('button', { name: 'Edit Status' })).toBeDisabled();
  });

  it('lets staff change severity and refreshes the incident and activity', async () => {
    const user = userEvent.setup();
    const { refetch, refetchActivities } = renderWithIncident(<IncidentDetailsPanel />, {
      user: makeAuthUser('ANALYST'),
    });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit Severity' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Edit Severity' }));
    await chooseOption(user, screen.getByRole('combobox', { name: 'Severity' }), 'Critical');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(refetchActivities).toHaveBeenCalled());
    expect(updateIncidentSeverity).toHaveBeenCalledWith('incident-1', 'CRITICAL');
    expect(refetch).toHaveBeenCalled();
  });

  it('lets staff change status', async () => {
    const user = userEvent.setup();
    const { refetch } = renderWithIncident(<IncidentDetailsPanel />, { user: makeAuthUser('ADMIN') });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit Status' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Edit Status' }));
    await chooseOption(user, screen.getByRole('combobox', { name: 'Status' }), 'Resolved');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(refetch).toHaveBeenCalled());
    expect(updateIncidentStatus).toHaveBeenCalledWith('incident-1', 'RESOLVED');
  });
});
