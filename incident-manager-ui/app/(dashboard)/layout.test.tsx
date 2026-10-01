import { screen, waitFor } from '@testing-library/react';
import { makeAuthUser } from '@/test-utils/fixtures';
import { resetNavigation, router } from '@/test-utils/navigation';
import { renderWithAuth } from '@/test-utils/render';
import DashboardLayout from './layout';

jest.mock('next/navigation', () => require('@/test-utils/navigation').navigationMock);

beforeEach(resetNavigation);

describe('DashboardLayout', () => {
  it('redirects to login when signed out', async () => {
    renderWithAuth(<DashboardLayout>content</DashboardLayout>, null);
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/login'));
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('renders the shell and children when signed in', async () => {
    renderWithAuth(<DashboardLayout>content</DashboardLayout>, makeAuthUser());
    expect(await screen.findByText('content')).toBeInTheDocument();
    expect(screen.getByText('SecureOps')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.queryByText(/demo mode/)).not.toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('shows the demo banner for demo sessions', async () => {
    renderWithAuth(<DashboardLayout>content</DashboardLayout>, makeAuthUser('ADMIN', { isDemo: true }));
    expect(await screen.findByText(/You are in demo mode/)).toBeInTheDocument();
  });
});
