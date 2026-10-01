import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeAuthUser } from '@/test-utils/fixtures';
import { renderWithIncident } from '@/test-utils/render';
import { IncidentActionsPanel } from './IncidentActionsPanel';

jest.mock('@/lib/api', () => ({
  getAnalysts: jest.fn().mockResolvedValue([]),
  assignIncident: jest.fn(),
  createIncident: jest.fn(),
  updateIncident: jest.fn().mockResolvedValue({}),
}));

describe('IncidentActionsPanel', () => {
  it('only shows Export for client users', async () => {
    renderWithIncident(<IncidentActionsPanel />, { user: makeAuthUser('CLIENT_USER') });
    expect(await screen.findByRole('button', { name: 'Export Details' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reassign Incident' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit Incident' })).not.toBeInTheDocument();
  });

  it('opens the reassign dialog for staff', async () => {
    const user = userEvent.setup();
    renderWithIncident(<IncidentActionsPanel />, { user: makeAuthUser('ANALYST') });

    await user.click(await screen.findByRole('button', { name: 'Reassign Incident' }));

    expect(screen.getByRole('dialog', { name: 'Assign Analyst' })).toBeInTheDocument();
  });

  it('opens the edit form prefilled and refetches after saving', async () => {
    const user = userEvent.setup();
    const { refetch, incident } = renderWithIncident(<IncidentActionsPanel />, {
      user: makeAuthUser('ADMIN'),
    });

    await user.click(await screen.findByRole('button', { name: 'Edit Incident' }));
    expect(screen.getByRole('dialog', { name: 'Edit Incident' })).toBeInTheDocument();
    expect(screen.getByLabelText('Title *')).toHaveValue(incident.title);

    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(refetch).toHaveBeenCalled());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the edit form on Cancel', async () => {
    const user = userEvent.setup();
    renderWithIncident(<IncidentActionsPanel />, { user: makeAuthUser('ADMIN') });
    await user.click(await screen.findByRole('button', { name: 'Edit Incident' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
