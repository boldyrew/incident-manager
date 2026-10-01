import '@/test-utils/disable-demo-mode';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { loginRequest } from '@/lib/auth';
import { makeAuthUser } from '@/test-utils/fixtures';
import { resetNavigation, router } from '@/test-utils/navigation';
import { renderWithAuth } from '@/test-utils/render';
import LoginPage from './page';

jest.mock('next/navigation', () => require('@/test-utils/navigation').navigationMock);
jest.mock('@/lib/auth', () => ({ loginRequest: jest.fn() }));

const mockedLogin = loginRequest as jest.Mock;

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>, email = 'jane@secureops.io', password = 'pw') {
  await user.type(await screen.findByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('LoginPage', () => {
  beforeEach(() => {
    resetNavigation();
    mockedLogin.mockReset();
  });

  it('redirects signed-in users to incidents', async () => {
    renderWithAuth(<LoginPage />, makeAuthUser());
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/incidents'));
    expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument();
  });

  it('signs in and navigates to incidents', async () => {
    const user = userEvent.setup();
    mockedLogin.mockResolvedValue({ accessToken: 'tok', user: makeAuthUser('ANALYST') });
    renderWithAuth(<LoginPage />, null);

    await fillAndSubmit(user);

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/incidents'));
    expect(mockedLogin).toHaveBeenCalledWith('jane@secureops.io', 'pw');
    expect(localStorage.getItem('access_token')).toBe('tok');
  });

  it('shows the login error', async () => {
    const user = userEvent.setup();
    mockedLogin.mockRejectedValue(new Error('Invalid credentials'));
    renderWithAuth(<LoginPage />, null);

    await fillAndSubmit(user, 'jane@secureops.io', 'bad');

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
    expect(router.push).not.toHaveBeenCalled();
  });

  it('shows a generic error for non-Error rejections', async () => {
    const user = userEvent.setup();
    mockedLogin.mockRejectedValue('nope');
    renderWithAuth(<LoginPage />, null);
    await fillAndSubmit(user);
    expect(await screen.findByText('Login failed')).toBeInTheDocument();
  });

  it('disables the button while signing in', async () => {
    const user = userEvent.setup();
    mockedLogin.mockReturnValue(new Promise(() => {}));
    renderWithAuth(<LoginPage />, null);
    await fillAndSubmit(user);
    expect(screen.getByRole('button', { name: 'Signing in…' })).toBeDisabled();
  });

  it('hides the demo link when demo mode is off', async () => {
    renderWithAuth(<LoginPage />, null);
    await screen.findByLabelText('Email');
    expect(screen.queryByRole('link', { name: 'Try the live demo' })).not.toBeInTheDocument();
  });
});
