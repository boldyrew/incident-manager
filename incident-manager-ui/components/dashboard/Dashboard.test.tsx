import { render, screen, within } from '@testing-library/react';
import type { DashboardStats, RecentIncident } from '@/types/dashboard';
import { DashboardStatCard } from './DashboardStatCard';
import { DashboardStatsCards } from './DashboardStatsCards';
import { IncidentsBySeverityChart } from './IncidentsBySeverityChart';
import { IncidentsOverTimeChart } from './IncidentsOverTimeChart';
import { RecentIncidentsTable } from './RecentIncidentsTable';

jest.mock('@/components/charts/BarChart', () => ({
  BarChart: (props: { data: unknown[] }) => <pre data-testid="bar-chart">{JSON.stringify(props)}</pre>,
}));
jest.mock('@/components/charts/LinearChart', () => ({
  LinearChart: (props: { data: unknown[] }) => (
    <pre data-testid="linear-chart">{JSON.stringify(props)}</pre>
  ),
}));

const stats: DashboardStats = {
  openIncidents: 7,
  criticalIncidents: 2,
  resolvedThisWeek: 4,
  slaBreaches: 1,
  incidentsBySeverity: { CRITICAL: 2, HIGH: 3, MEDIUM: 1, LOW: 1 },
  incidentsOverTime: [
    { day: 'Mon', count: 1 },
    { day: 'Tue', count: 3 },
  ],
};

const chartProps = (testId: string) => JSON.parse(screen.getByTestId(testId).textContent!);

describe('DashboardStatCard', () => {
  it('shows an upward trend', () => {
    render(<DashboardStatCard icon={null} iconBg="" label="Open" value={7} trend={12} trendLabel="vs last week" />);
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByTitle('vs last week')).toHaveTextContent('+12%');
    expect(screen.getByTitle('vs last week')).toHaveClass('text-orange-400');
  });

  it('shows a downward trend', () => {
    render(<DashboardStatCard icon={null} iconBg="" label="SLA" value={1} trend={-50} trendLabel="t" />);
    expect(screen.getByTitle('t')).toHaveTextContent('-50%');
    expect(screen.getByTitle('t')).toHaveClass('text-emerald-400');
  });
});

describe('DashboardStatsCards', () => {
  it('shows each stat', () => {
    render(<DashboardStatsCards stats={stats} />);
    for (const [label, value] of [
      ['Open Incidents', '7'],
      ['Critical Incidents', '2'],
      ['Resolved This Week', '4'],
      ['SLA Breaches', '1'],
    ]) {
      expect(screen.getByText(label).previousElementSibling).toHaveTextContent(value);
    }
  });

  // NOTE: the trend percentages are hard-coded (+12%, -3%, +18%, -50%), not derived from data.
  it('falls back to zero without stats', () => {
    render(<DashboardStatsCards stats={null} />);
    expect(screen.getAllByText('0')).toHaveLength(4);
  });
});

describe('IncidentsBySeverityChart', () => {
  it('maps severity counts to chart data', () => {
    render(<IncidentsBySeverityChart stats={stats} />);
    expect(chartProps('bar-chart')).toEqual({
      data: [
        { name: 'Critical', count: 2 },
        { name: 'High', count: 3 },
        { name: 'Medium', count: 1 },
        { name: 'Low', count: 1 },
      ],
      xDataKey: 'name',
      yDataKey: 'count',
    });
  });

  it('passes empty data without stats', () => {
    render(<IncidentsBySeverityChart stats={null} />);
    expect(chartProps('bar-chart').data).toEqual([]);
  });
});

describe('IncidentsOverTimeChart', () => {
  it('passes the 7-day series', () => {
    const { rerender } = render(<IncidentsOverTimeChart stats={stats} />);
    expect(chartProps('linear-chart')).toMatchObject({ data: stats.incidentsOverTime, xDataKey: 'day' });
    rerender(<IncidentsOverTimeChart stats={null} />);
    expect(chartProps('linear-chart').data).toEqual([]);
  });
});

describe('RecentIncidentsTable', () => {
  const NOW = new Date('2026-03-15T12:00:00.000Z');
  const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();
  const recent = (id: string, detectedAt: string, tenant: RecentIncident['tenant'] = null): RecentIncident => ({
    id,
    code: `INC-${id}`,
    title: `Incident ${id}`,
    severity: 'HIGH',
    status: 'OPEN',
    client: 'Raw client',
    detectedAt,
    tenant,
  });

  beforeEach(() => jest.useFakeTimers().setSystemTime(NOW));
  afterEach(() => jest.useRealTimers());

  it('shows relative times and prefers the tenant name', () => {
    render(
      <RecentIncidentsTable
        incidents={[
          recent('1', ago(5 * 60_000), { id: 't', name: 'Tenant Name', alias: 't' }),
          recent('2', ago(60 * 60_000)),
          recent('3', ago(3 * 60 * 60_000)),
          recent('4', ago(24 * 60 * 60_000)),
          recent('5', ago(3 * 24 * 60 * 60_000)),
        ]}
      />,
    );
    const rows = screen.getAllByRole('row').slice(1);
    expect(within(rows[0]).getByText('Tenant Name')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Raw client')).toBeInTheDocument();
    expect(rows.map((r) => r.lastElementChild!.textContent)).toEqual([
      '5 min ago',
      '1 hour ago',
      '3 hours ago',
      '1 day ago',
      '3 days ago',
    ]);
  });

  it('hides actions and the assignee column', () => {
    render(<RecentIncidentsTable incidents={[]} />);
    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent);
    expect(headers).not.toContain('Assigned To');
    expect(headers).not.toContain('Actions');
    expect(headers).toContain('Time');
    expect(screen.getByText('No incidents yet')).toBeInTheDocument();
  });
});
