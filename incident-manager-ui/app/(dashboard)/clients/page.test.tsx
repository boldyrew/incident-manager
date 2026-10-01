import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTenant, getTenants, getTenantStats } from '@/lib/api';
import { makeAuthUser, makeTenant } from '@/test-utils/fixtures';
import { renderWithAuth } from '@/test-utils/render';
import ClientsPage from './page';

jest.mock('@/lib/api', () => ({
  getTenants: jest.fn(),
  getTenantStats: jest.fn(),
  createTenant: jest.fn(),
}));

describe('ClientsPage', () => {
  beforeEach(() => {
    (getTenants as jest.Mock).mockReset().mockResolvedValue([makeTenant()]);
    (getTenantStats as jest.Mock)
      .mockReset()
      .mockResolvedValue({ totalClients: 1, openIncidents: 3, criticalIncidents: 1, resolvedThisMonth: 5 });
    (createTenant as jest.Mock).mockReset().mockResolvedValue(makeTenant());
  });

  it('loads tenants and stats', async () => {
    renderWithAuth(<ClientsPage />, makeAuthUser('ANALYST'));
    expect(await screen.findByRole('heading', { name: 'Acme Corp' })).toBeInTheDocument();
    expect(screen.getByText('Total Clients').previousElementSibling).toHaveTextContent('1');
    expect(screen.queryByRole('button', { name: /Add Client/ })).not.toBeInTheDocument();
  });

  it('lets admins add a client and reloads', async () => {
    const user = userEvent.setup();
    renderWithAuth(<ClientsPage />, makeAuthUser('ADMIN'));

    await user.click(await screen.findByRole('button', { name: /Add Client/ }));
    await user.type(screen.getByLabelText('Name'), 'Globex');
    await user.type(screen.getByLabelText('Alias (unique identifier)'), 'globex');
    await user.click(screen.getByRole('button', { name: 'Create Client' }));

    await waitFor(() => expect(getTenants).toHaveBeenCalledTimes(2));
    expect(createTenant).toHaveBeenCalledWith(expect.objectContaining({ name: 'Globex', alias: 'globex' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
