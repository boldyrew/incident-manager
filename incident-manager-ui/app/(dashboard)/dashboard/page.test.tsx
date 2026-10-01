import { render, screen } from '@testing-library/react';
import { getDashboardStats, getRecentIncidents } from '@/lib/api';
import DashboardPage from './page';

jest.mock('@/lib/api', () => ({ getDashboardStats: jest.fn(), getRecentIncidents: jest.fn() }));
jest.mock('@/components/charts/BarChart', () => ({ BarChart: () => <div data-testid="bar-chart" /> }));
jest.mock('@/components/charts/LinearChart', () => ({ LinearChart: () => <div data-testid="linear-chart" /> }));

describe('DashboardPage', () => {
  it('shows a spinner, then the stats, charts and recent incidents', async () => {
    (getDashboardStats as jest.Mock).mockResolvedValue({
      openIncidents: 7,
      criticalIncidents: 2,
      resolvedThisWeek: 4,
      slaBreaches: 1,
      incidentsBySeverity: { CRITICAL: 2, HIGH: 3, MEDIUM: 1, LOW: 1 },
      incidentsOverTime: [],
    });
    (getRecentIncidents as jest.Mock).mockResolvedValue([]);

    const { container } = render(<DashboardPage />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Open Incidents').previousElementSibling).toHaveTextContent('7');
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('linear-chart')).toBeInTheDocument();
    expect(screen.getByText('No incidents yet')).toBeInTheDocument();
    expect(getDashboardStats).toHaveBeenCalledWith();
    expect(getRecentIncidents).toHaveBeenCalledWith();
  });
});
