import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { makeAuthUser } from '@/test-utils/fixtures';
import { seedAuth } from '@/test-utils/render';
import { AuthProvider, useAuth } from './auth-context';

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthProvider', () => {
  it('finishes loading with no session when storage is empty', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('restores the session from localStorage', async () => {
    const user = makeAuthUser('ADMIN');
    seedAuth(user, 'stored-token');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.token).toBe('stored-token');
    expect(result.current.user).toEqual(user);
  });

  it('ignores a token without a stored user', async () => {
    localStorage.setItem('access_token', 'orphan');
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.token).toBeNull();
  });

  it('login persists and exposes the session', async () => {
    const user = makeAuthUser('ANALYST');
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => result.current.login('new-token', user));

    expect(result.current.token).toBe('new-token');
    expect(result.current.user).toEqual(user);
    expect(localStorage.getItem('access_token')).toBe('new-token');
    expect(JSON.parse(localStorage.getItem('auth_user')!)).toEqual(user);
  });

  it('logout clears the session and storage', async () => {
    seedAuth(makeAuthUser());
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.token).not.toBeNull());

    act(() => result.current.logout());

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('useAuth throws outside the provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within AuthProvider');
    jest.restoreAllMocks();
  });
});
