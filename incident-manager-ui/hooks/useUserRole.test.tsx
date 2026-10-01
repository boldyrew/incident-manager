import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/auth-context';
import { makeAuthUser } from '@/test-utils/fixtures';
import { seedAuth } from '@/test-utils/render';
import { useUserRole } from './useUserRole';

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe('useUserRole', () => {
  it.each([
    ['ADMIN', true],
    ['ANALYST', true],
    ['CLIENT_USER', false],
  ] as const)('%s -> isStaffRole=%s', async (role, expected) => {
    seedAuth(makeAuthUser(role));
    const { result } = renderHook(() => useUserRole(), { wrapper });
    await waitFor(() => expect(result.current.isStaffRole).toBe(expected));
  });

  it('is not staff when signed out', () => {
    const { result } = renderHook(() => useUserRole(), { wrapper });
    expect(result.current.isStaffRole).toBe(false);
  });
});
