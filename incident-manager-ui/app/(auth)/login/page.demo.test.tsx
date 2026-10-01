import '@/test-utils/enable-demo-mode';
import { screen } from '@testing-library/react';
import { renderWithAuth } from '@/test-utils/render';
import LoginPage from './page';

jest.mock('next/navigation', () => require('@/test-utils/navigation').navigationMock);

describe('LoginPage with demo mode', () => {
  it('links to the live demo', async () => {
    renderWithAuth(<LoginPage />, null);
    expect(await screen.findByRole('link', { name: 'Try the live demo' })).toHaveAttribute('href', '/demo');
  });
});
