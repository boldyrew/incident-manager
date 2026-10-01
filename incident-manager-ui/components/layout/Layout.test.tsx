import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeAuthUser } from '@/test-utils/fixtures';
import { navigationState, resetNavigation, router } from '@/test-utils/navigation';
import { renderWithAuth } from '@/test-utils/render';
import { ContentPanel } from './ContentPanel';
import { DemoBanner } from './DemoBanner';
import PageTitle from './PageTitle';
import SearchBar from './SearchBar';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

jest.mock('next/navigation', () => require('@/test-utils/navigation').navigationMock);

beforeEach(resetNavigation);

describe('Sidebar', () => {
  it('shows only enabled navigation items', () => {
    renderWithAuth(<Sidebar />, null);
    const links = screen.getAllByRole('link').map((l) => [l.textContent, l.getAttribute('href')]);
    expect(links).toEqual([
      ['Dashboard', '/dashboard'],
      ['Incidents', '/incidents'],
      ['Tickets', '/tickets'],
      ['Clients', '/clients'],
    ]);
  });

  it.each([
    ['/incidents', 'Incidents'],
    ['/incidents/incident-1', 'Incidents'],
    ['/tickets', 'Tickets'],
  ])('highlights the active item for %s', (pathname, active) => {
    navigationState.pathname = pathname;
    renderWithAuth(<Sidebar />, null);
    expect(screen.getByRole('link', { name: active })).toHaveClass('text-primary');
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveClass('text-primary');
  });

  it('shows the signed-in user', async () => {
    renderWithAuth(<Sidebar />, makeAuthUser('ADMIN', { fullName: 'Ada Lovelace' }));
    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('shows fallbacks when signed out', () => {
    renderWithAuth(<Sidebar />, null);
    expect(screen.getByText('Security Analyst')).toBeInTheDocument();
    expect(screen.getByText('SA')).toBeInTheDocument();
  });

  it('logs out and redirects to login', async () => {
    const user = userEvent.setup();
    renderWithAuth(<Sidebar />, makeAuthUser());
    await screen.findByText('Jane Analyst');

    await user.click(screen.getByTitle('Sign out'));

    expect(router.push).toHaveBeenCalledWith('/login');
    expect(localStorage.getItem('access_token')).toBeNull();
    await waitFor(() => expect(screen.getByText('Security Analyst')).toBeInTheDocument());
  });
});

describe('DemoBanner', () => {
  it('logs out and returns to the demo page', async () => {
    const user = userEvent.setup();
    renderWithAuth(<DemoBanner />, makeAuthUser('ANALYST', { isDemo: true }));

    expect(screen.getByText(/You are in demo mode/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Exit demo' }));

    expect(router.push).toHaveBeenCalledWith('/demo');
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
});

describe('PageTitle', () => {
  it('renders title, optional subtitle and right panel', () => {
    const { rerender } = render(<PageTitle title="Incidents" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Incidents' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(<PageTitle title="Incidents" subtitle="All of them" rightPanel={<button>Go</button>} />);
    expect(screen.getByText('All of them')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });
});

describe('ContentPanel', () => {
  it('renders an optional heading and children', () => {
    const { rerender } = render(<ContentPanel>body</ContentPanel>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    rerender(<ContentPanel title="Actions">body</ContentPanel>);
    expect(screen.getByRole('heading', { level: 2, name: 'Actions' })).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });
});

describe('SearchBar', () => {
  // NOTE: the search input only keeps local state; it is not wired to any page (Topbar comments it out).
  it('keeps the typed value', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);
    await user.type(screen.getByPlaceholderText('Search incidents...'), 'phish');
    expect(screen.getByPlaceholderText('Search incidents...')).toHaveValue('phish');
  });
});

describe('Topbar', () => {
  it('renders an empty header', () => {
    render(<Topbar />);
    expect(screen.getByRole('banner')).toBeEmptyDOMElement();
  });
});
