import '@/test-utils/disable-demo-mode';
import { waitFor } from '@testing-library/react';
import { router } from '@/test-utils/navigation';
import { renderWithAuth } from '@/test-utils/render';
import DemoPage from './page';

jest.mock('next/navigation', () => require('@/test-utils/navigation').navigationMock);

describe('DemoPage with demo mode off', () => {
  it('renders nothing and redirects to login', async () => {
    const { container } = renderWithAuth(<DemoPage />, null);
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/login'));
    expect(container).toBeEmptyDOMElement();
  });
});
