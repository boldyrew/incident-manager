import '@/test-utils/enable-demo-mode';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { demoLoginRequest } from '@/lib/auth';
import { makeAuthUser } from '@/test-utils/fixtures';
import { resetNavigation, router } from '@/test-utils/navigation';
import { renderWithAuth } from '@/test-utils/render';
import DemoLayout from '../layout';
import DemoPage from './page';

jest.mock('next/navigation', () => require('@/test-utils/navigation').navigationMock);
jest.mock('@/lib/auth', () => ({ demoLoginRequest: jest.fn() }));

const mockedDemoLogin = demoLoginRequest as jest.Mock;

describe('DemoPage', () => {
  beforeEach(() => {
    resetNavigation();
    mockedDemoLogin.mockReset();
  });

  it('redirects signed-in users to incidents', async () => {
    renderWithAuth(<DemoPage />, makeAuthUser());
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/incidents'));
  });

  it('offers one entry per role', async () => {
    renderWithAuth(<DemoPage />, null);
    expect(await screen.findByRole('button', { name: 'Enter as Security Admin' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enter as Security Analyst' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enter as Client View' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
  });

  it('logs in as the chosen role', async () => {
    const user = userEvent.setup();
    mockedDemoLogin.mockResolvedValue({
      accessToken: 'demo-tok',
      user: makeAuthUser('CLIENT_USER', { isDemo: true }),
    });
    renderWithAuth(<DemoPage />, null);

    await user.click(await screen.findByRole('button', { name: 'Enter as Client View' }));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/incidents'));
    expect(mockedDemoLogin).toHaveBeenCalledWith('CLIENT_USER');
    expect(localStorage.getItem('access_token')).toBe('demo-tok');
  });

  it('disables every role while one is loading', async () => {
    const user = userEvent.setup();
    mockedDemoLogin.mockReturnValue(new Promise(() => {}));
    renderWithAuth(<DemoPage />, null);

    await user.click(await screen.findByRole('button', { name: 'Enter as Security Admin' }));

    expect(screen.getByRole('button', { name: /Entering/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Enter as Security Analyst' })).toBeDisabled();
  });

  it('shows the error and re-enables the roles when login fails', async () => {
    const user = userEvent.setup();
    mockedDemoLogin.mockRejectedValue(new Error('Demo user not found'));
    renderWithAuth(<DemoPage />, null);

    await user.click(await screen.findByRole('button', { name: 'Enter as Security Analyst' }));

    expect(await screen.findByText('Demo user not found')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enter as Security Analyst' })).toBeEnabled();
  });

  it('shows a generic error for non-Error rejections', async () => {
    const user = userEvent.setup();
    mockedDemoLogin.mockRejectedValue('nope');
    renderWithAuth(<DemoPage />, null);
    await user.click(await screen.findByRole('button', { name: 'Enter as Security Admin' }));
    expect(await screen.findByText('Demo login failed')).toBeInTheDocument();
  });
});

describe('DemoLayout', () => {
  it('renders its children', () => {
    render(<DemoLayout>inner</DemoLayout>);
    expect(screen.getByText('inner')).toBeInTheDocument();
  });
});
