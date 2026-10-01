import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { updateIncidentDescription, updateIncidentTitle } from '@/lib/api';
import { makeAuthUser, makeIncident } from '@/test-utils/fixtures';
import { renderWithIncident } from '@/test-utils/render';
import { IncidentSummaryPanel } from './IncidentSummaryPanel';

jest.mock('@/lib/api', () => ({
  updateIncidentTitle: jest.fn().mockResolvedValue(undefined),
  updateIncidentDescription: jest.fn().mockResolvedValue(undefined),
}));

describe('IncidentSummaryPanel', () => {
  it('shows badges, title and description', () => {
    renderWithIncident(<IncidentSummaryPanel />, {
      entity: makeIncident({ severity: 'CRITICAL', status: 'IN_PROGRESS' }),
    });
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Title' })).toHaveTextContent(
      'Suspicious login attempts from unknown IP',
    );
    expect(screen.getByRole('button', { name: 'Edit Description' })).toHaveTextContent(
      'Multiple failed logins',
    );
  });

  it('shows a placeholder for a missing description', () => {
    renderWithIncident(<IncidentSummaryPanel />, { entity: makeIncident({ description: undefined }) });
    expect(screen.getByText('Click to add a description…')).toBeInTheDocument();
  });

  it('is read-only for client users', async () => {
    renderWithIncident(<IncidentSummaryPanel />, { user: makeAuthUser('CLIENT_USER') });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit Title' })).toBeDisabled());
    expect(screen.getByRole('button', { name: 'Edit Description' })).toBeDisabled();
  });

  it('saves the title and refreshes', async () => {
    const user = userEvent.setup();
    const { refetch, refetchActivities } = renderWithIncident(<IncidentSummaryPanel />, {
      user: makeAuthUser('ANALYST'),
    });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit Title' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Edit Title' }));
    await user.clear(screen.getByRole('textbox', { name: 'Title' }));
    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Updated title{Enter}');

    await waitFor(() => expect(refetchActivities).toHaveBeenCalled());
    expect(updateIncidentTitle).toHaveBeenCalledWith('incident-1', 'Updated title');
    expect(refetch).toHaveBeenCalled();
  });

  it('saves the description', async () => {
    const user = userEvent.setup();
    const { refetch } = renderWithIncident(<IncidentSummaryPanel />, { user: makeAuthUser('ADMIN') });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit Description' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Edit Description' }));
    await user.type(screen.getByRole('textbox', { name: 'Description' }), ' and more');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(refetch).toHaveBeenCalled());
    expect(updateIncidentDescription).toHaveBeenCalledWith('incident-1', 'Multiple failed logins and more');
  });
});
