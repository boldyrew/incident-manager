/**
 * Shared mock for `next/navigation`. Use in a test file with:
 *   jest.mock('next/navigation', () => require('@/test-utils/navigation').navigationMock);
 */
export const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

export const navigationState = {
  pathname: '/incidents',
  params: {} as Record<string, string | string[]>,
};

export const navigationMock = {
  useRouter: () => router,
  usePathname: () => navigationState.pathname,
  useParams: () => navigationState.params,
  redirect: jest.fn(),
};

export function resetNavigation() {
  Object.values(router).forEach((fn) => fn.mockReset());
  navigationState.pathname = '/incidents';
  navigationState.params = {};
}
